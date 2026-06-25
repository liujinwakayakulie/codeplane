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

export type ServerEvent =
  | { type: "connected"; connId: string }
  | { type: "human:matching"; promptId: string }
  | { type: "human:matched"; promptId: string }
  | { type: "human:reply"; promptId: string; text: string; thinking: boolean }
  | { type: "copilot:prompt"; matchId: string; promptId: string; text: string }
  | { type: "copilot:cancelled"; matchId: string };

type HumanPrompt = {
  id: string;
  connId: string;
  text: string;
  createdAt: number;
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

const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

class Matcher {
  private humans = new Map<string, HumanPrompt>();
  private copilots = new Map<string, CopilotSlot>();
  private matches = new Map<string, Match>();
  private subscribers = new Map<string, Send>();

  // —— SSE 订阅 ——

  enroll(connId: string, send: Send) {
    this.subscribers.set(connId, send);
  }

  withdraw(connId: string) {
    this.subscribers.delete(connId);

    // 把这个 connId 等待中的 prompt 删掉（人类走了，提问不再有效）
    for (const [pid, p] of this.humans) {
      if (p.connId === connId) this.humans.delete(pid);
    }

    // 把这个 connId 的 copilot slot 删掉
    this.copilots.delete(connId);

    // 进行中的 match：另一方收到 copilot:cancelled（如果对方是 copilot 走了）
    // MVP 简化：直接删 match，不动另一边
    for (const [mid, m] of this.matches) {
      if (m.copilotConnId === connId || m.prompt.connId === connId) {
        this.matches.delete(mid);
      }
    }
  }

  // —— 入队 ——

  enqueueHumanPrompt(connId: string, text: string): { promptId: string } {
    const prompt: HumanPrompt = {
      id: uid("p"),
      connId,
      text,
      createdAt: Date.now(),
    };
    this.humans.set(prompt.id, prompt);
    this.emit(connId, { type: "human:matching", promptId: prompt.id });
    this.tryMatch();
    return { promptId: prompt.id };
  }

  enqueueCopilot(connId: string) {
    this.copilots.set(connId, { connId, enrolledAt: Date.now() });
    this.tryMatch();
  }

  cancelWaiting(connId: string) {
    this.copilots.delete(connId);
  }

  // —— 对局操作 ——

  accept(matchId: string, connId: string) {
    const m = this.matches.get(matchId);
    if (!m || m.copilotConnId !== connId) return;
    m.state = "answering";
    m.acceptedAt = Date.now();
    this.emit(m.prompt.connId, { type: "human:matched", promptId: m.prompt.id });
  }

  skip(matchId: string, connId: string) {
    const m = this.matches.get(matchId);
    if (!m || m.copilotConnId !== connId) return;

    // 提问回 humans 队列（末尾，FIFO 不严格但够用）
    this.humans.set(m.prompt.id, m.prompt);
    // copilot 回 copilots 队列
    this.copilots.set(connId, { connId, enrolledAt: Date.now() });
    this.matches.delete(matchId);

    this.tryMatch();
  }

  reply(matchId: string, connId: string, text: string) {
    const m = this.matches.get(matchId);
    if (!m || m.copilotConnId !== connId) return;

    this.emit(m.prompt.connId, {
      type: "human:reply",
      promptId: m.prompt.id,
      text,
      thinking: true,
    });
    this.matches.delete(matchId);
    this.humans.delete(m.prompt.id);
    // 不自动 re-enqueue copilot：用户要求手动按按钮进下一轮
  }

  // —— 内部 ——

  private tryMatch() {
    while (this.humans.size > 0 && this.copilots.size > 0) {
      const prompt = this.humans.values().next().value!;
      const slot = this.copilots.values().next().value!;

      // 不和自己的提问匹配（人类双开兜底）
      if (prompt.connId === slot.connId) {
        // 把这个 copilot 临时挪走再匹配下一个；找不到合适的就放弃
        this.copilots.delete(slot.connId);
        if (this.copilots.size === 0) {
          this.copilots.set(slot.connId, slot);
          return;
        }
        const next = this.copilots.values().next().value!;
        this.copilots.delete(next.connId);
        // 把原 slot 还回去（保留在队列尾）
        this.copilots.set(slot.connId, slot);
        this.humans.delete(prompt.id);
        const match: Match = {
          id: uid("m"),
          prompt,
          copilotConnId: next.connId,
          state: "received",
        };
        this.matches.set(match.id, match);
        this.emit(next.connId, {
          type: "copilot:prompt",
          matchId: match.id,
          promptId: prompt.id,
          text: prompt.text,
        });
        continue;
      }

      this.humans.delete(prompt.id);
      this.copilots.delete(slot.connId);
      const match: Match = {
        id: uid("m"),
        prompt,
        copilotConnId: slot.connId,
        state: "received",
      };
      this.matches.set(match.id, match);
      this.emit(slot.connId, {
        type: "copilot:prompt",
        matchId: match.id,
        promptId: prompt.id,
        text: prompt.text,
      });
    }
  }

  private emit(connId: string, ev: ServerEvent) {
    const send = this.subscribers.get(connId);
    if (!send) return; // 没订阅就丢弃（客户端断开/未连上）
    try {
      send(ev);
    } catch {
      this.subscribers.delete(connId);
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
}

// —— 单例：globalThis 锁住，避免 dev HMR 多实例 ——

declare global {
  var __matcher: Matcher | undefined;
}

export const matcher: Matcher = globalThis.__matcher ?? new Matcher();
if (process.env.NODE_ENV !== "production") {
  globalThis.__matcher = matcher;
}
