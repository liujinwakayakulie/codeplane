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

export type ServerEvent =
  | { type: "connected"; connId: string }
  | { type: "human:matching"; promptId: string }
  | { type: "human:matched"; promptId: string }
  | { type: "human:reply"; promptId: string; text: string; thinking: boolean }
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

class Matcher {
  private humans = new Map<string, HumanPrompt>();
  private copilots = new Map<string, CopilotSlot>();
  private matches = new Map<string, Match>();
  private subscribers = new Map<string, Subscription>();

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
    });
    if (!delivered) {
      this.matches.delete(matchId);
      return { ok: false, error: "human disconnected" };
    }

    this.matches.delete(matchId);
    this.humans.delete(m.prompt.id);
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
    return { ok: true };
  }

  // —— 内部 ——

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
    return {
      humans: this.humans.size,
      copilots: this.copilots.size,
      matches: this.matches.size,
      subscribers: this.subscribers.size,
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
