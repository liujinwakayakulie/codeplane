/**
 * 进程内匹配器（单例）
 *
 * 维护四个 Map：
 *   - humans：等待被接的人类提问
 *   - copilots：等待接活的 copilot
 *   - matches：当前进行中的对局（copilot 收到/正在答）
 *   - subscribers：每个 connId 的 SSE 推送回调
 *
 * 任何入队操作后都会调 tryMatch() 立刻尝试撮合。
 *
 * 部署：仅适用于单实例 Node（自建 VPS / Render / Fly.io）。
 * Vercel Serverless 不行——每个请求可能是不同实例，内存不共享。
 */

import type { SkillId } from "@/lib/skills";
import {
  generateStandbyCopilotReply,
  isStandbyCopilotConfigured,
} from "@/lib/server/standbyCopilot";

export type ServerEvent =
  | { type: "connected"; connId: string }
  | { type: "human:matching"; promptId: string }
  | { type: "human:matched"; promptId: string }
  | {
      type: "human:reply";
      promptId: string;
      text: string;
      thinking: boolean;
      source?: "human" | "standby-ai";
    }
  | { type: "human:ultimate"; promptId: string; skill: SkillId }
  | {
      type: "queue-info";
      humansAhead: number;
      totalHumans: number;
      totalCopilots: number;
    }
  | { type: "copilot:prompt"; matchId: string; promptId: string; text: string }
  | { type: "copilot:cancelled"; matchId: string; reason: string };

type HumanPrompt = {
  id: string;
  connId: string;
  text: string;
  createdAt: number;
  disconnectedAt?: number;
  skippedBy?: Set<string>;
};

type CopilotSlot = {
  connId: string;
  enrolledAt: number;
};

type Match = {
  id: string;
  prompt: HumanPrompt;
  copilotConnId: string;
  state: "received" | "answering";
  acceptedAt?: number;
};

type Send = (ev: ServerEvent) => void;
type Subscription = { id: string; send: Send };
type MatcherResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

const DISCONNECT_GRACE_MS = 30_000;
const PROMPT_TTL_MS = 5 * 60_000;
const SLOT_TTL_MS = 2 * 60_000;
const AI_FALLBACK_AFTER_MS = 20_000;
const AI_FALLBACK_RATE_WINDOW_MS = 60 * 60_000;
const DEFAULT_AI_FALLBACK_PER_CONN_HOUR = 5;
const DEFAULT_AI_FALLBACK_MAX_CONCURRENT = 2;

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function aiFallbackEnabled(): boolean {
  return process.env.AI_FALLBACK_ENABLED !== "false" && isStandbyCopilotConfigured();
}

function aiFallbackPerConnHour(): number {
  return numberFromEnv(
    "AI_FALLBACK_PER_CONN_HOUR",
    DEFAULT_AI_FALLBACK_PER_CONN_HOUR
  );
}

function aiFallbackMaxConcurrent(): number {
  return numberFromEnv(
    "AI_FALLBACK_MAX_CONCURRENT",
    DEFAULT_AI_FALLBACK_MAX_CONCURRENT
  );
}

function aiFallbackAfterMs(): number {
  return numberFromEnv("AI_FALLBACK_AFTER_MS", AI_FALLBACK_AFTER_MS);
}

type FallbackTarget = {
  prompt: HumanPrompt;
  matchId?: string;
  copilotConnId?: string;
};

class Matcher {
  private humans = new Map<string, HumanPrompt>();
  private copilots = new Map<string, CopilotSlot>();
  private matches = new Map<string, Match>();
  private subscribers = new Map<string, Subscription>();
  private aiFallbackTimers?: Map<string, ReturnType<typeof setTimeout>>;
  private aiFallbackHits?: Map<string, number[]>;
  private aiFallbackInFlight?: number;

  // —— SSE 订阅 ——

  enroll(connId: string, send: Send): string {
    const subscriptionId = uid("s");
    this.subscribers.set(connId, { id: subscriptionId, send });

    this.pruneStale();
    for (const p of this.humans.values()) {
      if (p.connId === connId) {
        p.disconnectedAt = undefined;
      }
    }

    this.tryMatch();
    this.broadcastQueueInfo();
    return subscriptionId;
  }

  withdraw(connId: string, subscriptionId?: string) {
    const current = this.subscribers.get(connId);
    if (subscriptionId && current && current.id !== subscriptionId) {
      return;
    }

    this.subscribers.delete(connId);
    const now = Date.now();

    // 等待中的 human prompt 先保留一个短 grace，避免 SSE 短重连丢题。
    for (const p of this.humans.values()) {
      if (p.connId === connId) p.disconnectedAt = now;
    }

    // 把这个 connId 的 copilot slot 删掉
    this.copilots.delete(connId);

    for (const [mid, m] of this.matches) {
      if (m.copilotConnId === connId) {
        this.matches.delete(mid);
        if (this.isLive(m.prompt.connId)) {
          this.humans.set(m.prompt.id, m.prompt);
          this.emit(m.prompt.connId, {
            type: "human:matching",
            promptId: m.prompt.id,
          });
        }
      } else if (m.prompt.connId === connId) {
        this.matches.delete(mid);
        this.clearAiFallback(m.prompt.id);
        if (this.isLive(m.copilotConnId)) {
          this.emit(m.copilotConnId, {
            type: "copilot:cancelled",
            matchId: mid,
            reason: "human disconnected",
          });
          this.copilots.set(m.copilotConnId, {
            connId: m.copilotConnId,
            enrolledAt: now,
          });
        }
      }
    }

    this.pruneStale();
    this.tryMatch();
    this.broadcastQueueInfo();
  }

  // —— 入队 ——

  enqueueHumanPrompt(connId: string, text: string): MatcherResult<{ promptId: string }> {
    if (!this.isLive(connId)) {
      return { ok: false, error: "connection is not live" };
    }

    const prompt: HumanPrompt = {
      id: uid("p"),
      connId,
      text,
      createdAt: Date.now(),
    };
    this.humans.set(prompt.id, prompt);
    this.emit(connId, { type: "human:matching", promptId: prompt.id });
    this.scheduleAiFallback(prompt.id);
    this.broadcastQueueInfo();
    this.tryMatch();
    return { ok: true, promptId: prompt.id };
  }

  enqueueCopilot(connId: string): MatcherResult {
    if (!this.isLive(connId)) {
      return { ok: false, error: "connection is not live" };
    }

    this.copilots.set(connId, { connId, enrolledAt: Date.now() });
    this.broadcastQueueInfo();
    this.tryMatch();
    return { ok: true };
  }

  cancelWaiting(connId: string): MatcherResult {
    this.copilots.delete(connId);
    this.broadcastQueueInfo();
    return { ok: true };
  }

  // —— 对局操作 ——

  accept(matchId: string, connId: string): MatcherResult {
    const m = this.matches.get(matchId);
    if (!m || m.copilotConnId !== connId) {
      return { ok: false, error: "match not found" };
    }
    if (!this.isLive(m.prompt.connId)) {
      this.matches.delete(matchId);
      return { ok: false, error: "human disconnected" };
    }

    m.state = "answering";
    m.acceptedAt = Date.now();
    this.emit(m.prompt.connId, { type: "human:matched", promptId: m.prompt.id });
    return { ok: true };
  }

  skip(matchId: string, connId: string): MatcherResult {
    const m = this.matches.get(matchId);
    if (!m || m.copilotConnId !== connId) {
      return { ok: false, error: "match not found" };
    }

    this.matches.delete(matchId);

    m.prompt.skippedBy ??= new Set<string>();
    m.prompt.skippedBy.add(connId);
    if (this.isLive(m.prompt.connId)) {
      this.humans.set(m.prompt.id, m.prompt);
      this.emit(m.prompt.connId, {
        type: "human:matching",
        promptId: m.prompt.id,
      });
    }
    if (this.isLive(connId)) {
      this.copilots.set(connId, { connId, enrolledAt: Date.now() });
    }

    this.tryMatch();
    return { ok: true };
  }

  reply(matchId: string, connId: string, text: string): MatcherResult {
    const m = this.matches.get(matchId);
    if (!m || m.copilotConnId !== connId) {
      return { ok: false, error: "match not found" };
    }
    if (!this.isLive(m.prompt.connId)) {
      this.matches.delete(matchId);
      return { ok: false, error: "human disconnected" };
    }

    const delivered = this.emit(m.prompt.connId, {
      type: "human:reply",
      promptId: m.prompt.id,
      text,
      thinking: true,
      source: "human",
    });
    if (!delivered) {
      this.matches.delete(matchId);
      return { ok: false, error: "human disconnected" };
    }

    this.matches.delete(matchId);
    this.humans.delete(m.prompt.id);
    this.clearAiFallback(m.prompt.id);
    // 不自动 re-enqueue copilot：用户要求手动按按钮进下一轮
    return { ok: true };
  }

  /**
   * Copilot 对当前 match 的 human 放大招 = 终结对线
   * 校验：必须是该 match 的 copilot 才能放（防作弊）
   * 行为：推送 human:ultimate（含 promptId 让客户端替换占位）+ 删除 match
   */
  castUltimate(matchId: string, connId: string, skill: SkillId): MatcherResult {
    const m = this.matches.get(matchId);
    if (!m || m.copilotConnId !== connId) {
      return { ok: false, error: "match not found" };
    }
    if (!this.isLive(m.prompt.connId)) {
      this.matches.delete(matchId);
      return { ok: false, error: "human disconnected" };
    }

    const delivered = this.emit(m.prompt.connId, {
      type: "human:ultimate",
      promptId: m.prompt.id,
      skill,
    });
    if (!delivered) {
      this.matches.delete(matchId);
      return { ok: false, error: "human disconnected" };
    }

    this.matches.delete(matchId);
    this.humans.delete(m.prompt.id);
    this.clearAiFallback(m.prompt.id);
    return { ok: true };
  }

  // —— 内部 ——

  private ensureAiFallbackState() {
    this.aiFallbackTimers ??= new Map<string, ReturnType<typeof setTimeout>>();
    this.aiFallbackHits ??= new Map<string, number[]>();
    this.aiFallbackInFlight ??= 0;
  }

  private scheduleAiFallback(promptId: string) {
    if (!aiFallbackEnabled()) return;

    this.ensureAiFallbackState();
    this.clearAiFallback(promptId);
    const timer = setTimeout(() => {
      void this.runAiFallback(promptId);
    }, aiFallbackAfterMs());
    this.aiFallbackTimers?.set(promptId, timer);
  }

  private clearAiFallback(promptId: string) {
    this.ensureAiFallbackState();
    const timer = this.aiFallbackTimers?.get(promptId);
    if (timer) clearTimeout(timer);
    this.aiFallbackTimers?.delete(promptId);
  }

  private reservePromptForAiFallback(promptId: string): FallbackTarget | null {
    const queuedPrompt = this.humans.get(promptId);
    if (queuedPrompt) {
      if (!this.isPromptMatchable(queuedPrompt)) return null;
      this.humans.delete(promptId);
      return { prompt: queuedPrompt };
    }

    for (const [matchId, match] of this.matches) {
      if (match.prompt.id !== promptId) continue;
      if (!this.isLive(match.prompt.connId)) return null;

      this.matches.delete(matchId);
      if (this.isLive(match.copilotConnId)) {
        this.emit(match.copilotConnId, {
          type: "copilot:cancelled",
          matchId,
          reason: "round closed",
        });
        this.copilots.set(match.copilotConnId, {
          connId: match.copilotConnId,
          enrolledAt: Date.now(),
        });
      }
      return {
        prompt: match.prompt,
        matchId,
        copilotConnId: match.copilotConnId,
      };
    }

    return null;
  }

  private canUseAiFallback(connId: string): boolean {
    this.ensureAiFallbackState();
    const now = Date.now();
    const windowStart = now - AI_FALLBACK_RATE_WINDOW_MS;
    const hits = (this.aiFallbackHits?.get(connId) ?? []).filter(
      (hit) => hit >= windowStart
    );

    if (hits.length >= aiFallbackPerConnHour()) {
      this.aiFallbackHits?.set(connId, hits);
      return false;
    }

    hits.push(now);
    this.aiFallbackHits?.set(connId, hits);
    return true;
  }

  private restorePromptAfterAiFallback(prompt: HumanPrompt) {
    if (!this.isPromptMatchable(prompt)) {
      this.clearAiFallback(prompt.id);
      return;
    }

    this.humans.set(prompt.id, prompt);
    this.emit(prompt.connId, {
      type: "human:matching",
      promptId: prompt.id,
    });
    this.broadcastQueueInfo();
    this.tryMatch();
  }

  private async runAiFallback(promptId: string) {
    this.ensureAiFallbackState();
    this.aiFallbackTimers?.delete(promptId);

    if (!aiFallbackEnabled()) return;

    const target = this.reservePromptForAiFallback(promptId);
    if (!target) return;

    const { prompt } = target;
    if (!this.isLive(prompt.connId)) return;

    if (!this.canUseAiFallback(prompt.connId)) {
      this.restorePromptAfterAiFallback(prompt);
      return;
    }

    if ((this.aiFallbackInFlight ?? 0) >= aiFallbackMaxConcurrent()) {
      this.restorePromptAfterAiFallback(prompt);
      return;
    }

    this.aiFallbackInFlight = (this.aiFallbackInFlight ?? 0) + 1;
    this.emit(prompt.connId, {
      type: "human:matched",
      promptId: prompt.id,
    });
    this.broadcastQueueInfo();

    try {
      const reply = await generateStandbyCopilotReply(prompt.text);
      if (!this.isLive(prompt.connId)) return;

      const delivered = this.emit(prompt.connId, {
        type: "human:reply",
        promptId: prompt.id,
        text: reply.text,
        thinking: true,
        source: "standby-ai",
      });
      if (!delivered) return;

      this.humans.delete(prompt.id);
      this.clearAiFallback(prompt.id);
    } catch (e) {
      console.error("[standby copilot failed]", e);
      this.restorePromptAfterAiFallback(prompt);
    } finally {
      this.aiFallbackInFlight = Math.max(0, (this.aiFallbackInFlight ?? 1) - 1);
      this.broadcastQueueInfo();
    }
  }

  private tryMatch() {
    this.pruneStale();

    while (this.humans.size > 0 && this.copilots.size > 0) {
      const pair = this.findMatchablePair();
      if (!pair) break;
      const { prompt, slot } = pair;

      this.humans.delete(prompt.id);
      this.copilots.delete(slot.connId);
      const match: Match = {
        id: uid("m"),
        prompt,
        copilotConnId: slot.connId,
        state: "received",
      };
      const delivered = this.emit(slot.connId, {
        type: "copilot:prompt",
        matchId: match.id,
        promptId: prompt.id,
        text: prompt.text,
      });
      if (!delivered) {
        this.subscribers.delete(slot.connId);
        this.humans.set(prompt.id, prompt);
        continue;
      }
      this.matches.set(match.id, match);
    }
    this.broadcastQueueInfo();
  }

  private emit(connId: string, ev: ServerEvent): boolean {
    const subscription = this.subscribers.get(connId);
    if (!subscription) return false;
    try {
      subscription.send(ev);
      return true;
    } catch {
      this.subscribers.delete(connId);
      return false;
    }
  }

  private isLive(connId: string): boolean {
    return this.subscribers.has(connId);
  }

  private findMatchablePair():
    | { prompt: HumanPrompt; slot: CopilotSlot }
    | null {
    for (const prompt of this.humans.values()) {
      if (!this.isPromptMatchable(prompt)) continue;

      for (const slot of this.copilots.values()) {
        if (!this.isLive(slot.connId)) continue;
        if (slot.connId === prompt.connId) continue;
        if (prompt.skippedBy?.has(slot.connId)) continue;
        return { prompt, slot };
      }
    }
    return null;
  }

  private isPromptMatchable(prompt: HumanPrompt): boolean {
    if (!this.isLive(prompt.connId)) return false;
    if (prompt.disconnectedAt) return false;
    return true;
  }

  private pruneStale() {
    const now = Date.now();

    for (const [pid, p] of this.humans) {
      const tooOld = now - p.createdAt > PROMPT_TTL_MS;
      const disconnectedTooLong =
        p.disconnectedAt !== undefined &&
        now - p.disconnectedAt > DISCONNECT_GRACE_MS;
      if (tooOld || disconnectedTooLong) {
        this.humans.delete(pid);
        this.clearAiFallback(pid);
      }
    }

    for (const [connId, c] of this.copilots) {
      if (!this.isLive(connId) || now - c.enrolledAt > SLOT_TTL_MS) {
        this.copilots.delete(connId);
      }
    }
  }

  /** dev 用：观察内部状态 */
  debug() {
    this.ensureAiFallbackState();
    return {
      humans: this.humans.size,
      copilots: this.copilots.size,
      matches: this.matches.size,
      subscribers: this.subscribers.size,
      aiFallbackTimers: this.aiFallbackTimers?.size ?? 0,
      aiFallbackInFlight: this.aiFallbackInFlight ?? 0,
    };
  }

  /**
   * 给所有正在等待的 human/copilot 推送队列状态
   * humansAhead: 该 human 前面还排着几个 prompt（按入队时间）
   * totalHumans/totalCopilots: 全局正在等待的人数
   */
  private broadcastQueueInfo() {
    this.pruneStale();

    const liveHumans = [...this.humans.values()].filter((p) =>
      this.isPromptMatchable(p)
    );
    const liveCopilots = [...this.copilots.values()].filter((c) =>
      this.isLive(c.connId)
    );

    if (liveHumans.length === 0 && liveCopilots.length === 0) return;
    const totalH = liveHumans.length;
    const totalC = liveCopilots.length;
    let idx = 0;
    for (const p of liveHumans) {
      this.emit(p.connId, {
        type: "queue-info",
        humansAhead: idx,
        totalHumans: totalH,
        totalCopilots: totalC,
      });
      idx++;
    }
    for (const c of liveCopilots) {
      this.emit(c.connId, {
        type: "queue-info",
        // copilot 没有"前面"概念，给 0；consumer 关心 totalHumans（多少 prompt 等接）
        humansAhead: 0,
        totalHumans: totalH,
        totalCopilots: totalC,
      });
    }
  }
}

// —— 单例：globalThis 锁住，避免 dev HMR 多实例 ——
// dev 模式下 HMR 会重载 module，新方法可能没附加到旧实例；
// 用 setPrototypeOf 把最新 Matcher.prototype patch 到旧实例上，状态保留 + 新方法生效

declare global {
  var __matcher: Matcher | undefined;
}

function getMatcher(): Matcher {
  if (!globalThis.__matcher) {
    globalThis.__matcher = new Matcher();
  } else if (process.env.NODE_ENV !== "production") {
    Object.setPrototypeOf(globalThis.__matcher, Matcher.prototype);
  }
  return globalThis.__matcher;
}

export const matcher: Matcher = getMatcher();
