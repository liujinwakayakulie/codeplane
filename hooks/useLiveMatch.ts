"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/components/terminal/MessageBubble";
import { SKILL_MAP, type SkillId } from "@/lib/skills";
import { addConversation, listConversations } from "@/lib/client/conversationsDb";

/**
 * 实时匹配对线 hook（替代 useMockMatch）
 *
 * 通信：单条 EventSource 下行 + 多个 POST 上行
 *
 * 两个视角共用一条连接，consumer 按 role 取所需字段。
 *
 * connId 用 sessionStorage：每个 tab = 独立玩家，方便用同浏览器双 tab 自测。
 */

const CONN_ID_KEY = "yacb_conn_id";

export type CopilotState =
  | "idle"
  | "waiting"
  | "received"
  | "answering"
  | "done";

export type CurrentPrompt = {
  matchId: string;
  promptId: string;
  text: string;
};

const ACCEPT_SECONDS = 30;

function getOrCreateConnId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(CONN_ID_KEY);
    if (!id) {
      id = `c_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
      sessionStorage.setItem(CONN_ID_KEY, id);
    }
    return id;
  } catch {
    return `c_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function useLiveMatch(opts: {
  /** 收到对手（copilot）发来的大招时调用，consumer 通常用来触发本地特效 */
  onUltimateReceived?: (skill: SkillId) => void;
} = {}) {
  const [connId] = useState(getOrCreateConnId);
  const [connected, setConnected] = useState(false);

  // 最新 onUltimateReceived 引用，避免 EventSource effect 重建
  const onUltRef = useRef(opts.onUltimateReceived);
  useEffect(() => {
    onUltRef.current = opts.onUltimateReceived;
  });

  // —— human 视角 ——
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-init",
      role: "system",
      text: "session established. type a question below.",
    },
  ]);
  // 跟踪"刚发出的提问还没收到回复"状态 —— 用 state 才能在 useMemo/render 里读
  const [inflightPromptId, setInflightPromptId] = useState<string | null>(null);

  // —— copilot 视角 ——
  const [copilotState, setCopilotState] = useState<CopilotState>("idle");
  const [currentPrompt, setCurrentPrompt] = useState<CurrentPrompt | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [countdown, setCountdown] = useState(ACCEPT_SECONDS);

  // 用 ref 保存最新的 matchId，避免 stale closure 在倒计时归零时拿不到
  const currentMatchRef = useRef<string | null>(null);
  useEffect(() => {
    currentMatchRef.current = currentPrompt?.matchId ?? null;
  }, [currentPrompt]);

  // 当前 prompt 的文本（copilot 视角，用于 reply 完成时存历史）
  const currentPromptTextRef = useRef<string>("");
  useEffect(() => {
    currentPromptTextRef.current = currentPrompt?.text ?? "";
  }, [currentPrompt]);

  // human 视角：promptId → 原始 prompt 文本，reply 回来时取出存历史
  const pendingPromptsRef = useRef<Map<string, string>>(new Map());

  // —— mount 时加载历史对话填进 messages（human 视角）——
  useEffect(() => {
    let mounted = true;
    listConversations({ limit: 50 })
      .then((list) => {
        if (!mounted) return;
        // list 是降序（最新在前），反转后按时间升序追加到末尾
        const historical: ChatMessage[] = [];
        for (const conv of [...list].reverse()) {
          historical.push(
            { id: `${conv.id}-q`, role: "human", text: conv.prompt },
            { id: `${conv.id}-a`, role: "copilot", text: conv.reply }
          );
        }
        if (historical.length > 0) {
          setMessages((prev) => [...prev, ...historical]);
        }
      })
      .catch((e) => console.error("[load history]", e));
    return () => {
      mounted = false;
    };
  }, []);

  // —— EventSource 订阅（mount 一次）——
  useEffect(() => {
    const es = new EventSource(`/api/match/stream?connId=${connId}`);

    const onOpen = () => setConnected(true);
    const onError = () => setConnected(false);
    const onConnected = () => setConnected(true);

    const onHumanMatching = (e: MessageEvent) => {
      const { promptId } = JSON.parse(e.data);
      setInflightPromptId(promptId);
    };

    const onHumanMatched = (e: MessageEvent) => {
      const { promptId } = JSON.parse(e.data);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `match-${promptId}`
            ? { ...m, text: "// matched. waiting for reply..." }
            : m
        )
      );
    };

    const onHumanReply = (e: MessageEvent) => {
      const { promptId, text } = JSON.parse(e.data);
      // 取出原始提问文本，存到 IndexedDB
      const promptText = pendingPromptsRef.current.get(promptId);
      pendingPromptsRef.current.delete(promptId);
      if (promptText) {
        void addConversation({
          role: "human",
          prompt: promptText,
          reply: text,
        }).catch((err) => console.error("[addConversation]", err));
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `match-${promptId}`
            ? {
                ...m,
                role: "copilot",
                text,
                typing: true,
              }
            : m
        )
      );
      setInflightPromptId(null);
    };

    const onCopilotPrompt = (e: MessageEvent) => {
      const { matchId, promptId, text } = JSON.parse(e.data);
      setCurrentPrompt({ matchId, promptId, text });
      setCopilotState("received");
      setCountdown(ACCEPT_SECONDS);
    };

    const onHumanUltimate = (e: MessageEvent) => {
      const { skill } = JSON.parse(e.data) as { skill: SkillId };
      // 塞一条 system 调侃消息到 human 消息流，特效消失后仍保留（方便截图）
      const meta = SKILL_MAP[skill];
      if (meta?.castMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ult-${Date.now().toString(36)}-${skill}`,
            role: "system",
            text: meta.castMessage,
          },
        ]);
      }
      onUltRef.current?.(skill);
    };

    es.addEventListener("open", onOpen);
    es.addEventListener("error", onError);
    es.addEventListener("connected", onConnected as EventListener);
    es.addEventListener("human:matching", onHumanMatching as EventListener);
    es.addEventListener("human:matched", onHumanMatched as EventListener);
    es.addEventListener("human:reply", onHumanReply as EventListener);
    es.addEventListener("human:ultimate", onHumanUltimate as EventListener);
    es.addEventListener("copilot:prompt", onCopilotPrompt as EventListener);

    return () => {
      es.close();
      setConnected(false);
    };
  }, [connId]);

  // —— 上行操作 ——

  const sendPrompt = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || !connected) return;
      // 乐观：先加人类消息 + 占位 system
      const tempId = `h_${Date.now().toString(36)}`;
      setMessages((prev) => [
        ...prev,
        { id: tempId, role: "human", text: t },
      ]);
      try {
        const r = await fetch("/api/match/prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connId, text: t }),
        });
        const data = (await r.json()) as { ok: boolean; promptId?: string };
        if (data.ok && data.promptId) {
          pendingPromptsRef.current.set(data.promptId, t);
          setInflightPromptId(data.promptId);
          setMessages((prev) => [
            ...prev,
            {
              id: `match-${data.promptId}`,
              role: "system",
              text: "// matching...",
            },
          ]);
        }
      } catch (e) {
        console.error("[sendPrompt]", e);
      }
    },
    [connId, connected]
  );

  const markTypingDone = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, typing: false } : m))
    );
  }, []);

  const startWaiting = useCallback(async () => {
    if (!connected) return;
    setCopilotState("waiting");
    await fetch("/api/match/start-waiting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connId }),
    });
  }, [connId, connected]);

  const cancelWaiting = useCallback(async () => {
    setCopilotState("idle");
    await fetch("/api/match/cancel-waiting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connId }),
    });
  }, [connId]);

  const accept = useCallback(async () => {
    const matchId = currentMatchRef.current;
    if (!matchId) return;
    setCopilotState("answering");
    await fetch("/api/match/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connId, matchId, action: "accept" }),
    });
  }, [connId]);

  const skip = useCallback(async () => {
    const matchId = currentMatchRef.current;
    if (!matchId) return;
    setCurrentPrompt(null);
    setCopilotState("waiting");
    await fetch("/api/match/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connId, matchId, action: "skip" }),
    });
  }, [connId]);

  // —— 30s accept 倒计时（copilot received 态）——
  // 注意：必须在 skip 声明之后调用
  useEffect(() => {
    if (copilotState !== "received" || !currentPrompt) return;
    setCountdown(ACCEPT_SECONDS);
    const start = Date.now();
    const id = setInterval(() => {
      const next = Math.max(
        0,
        ACCEPT_SECONDS - Math.floor((Date.now() - start) / 1000)
      );
      setCountdown(next);
      if (next <= 0) {
        clearInterval(id);
        void skip();
      }
    }, 250);
    return () => clearInterval(id);
  }, [copilotState, currentPrompt, skip]);

  const reply = useCallback(
    async (text: string) => {
      const t = text.trim();
      const matchId = currentMatchRef.current;
      const promptText = currentPromptTextRef.current;
      if (!t || !matchId) return;
      setCopilotState("done");
      setAnsweredCount((n) => n + 1);
      // 存到 IndexedDB（copilot 视角）
      if (promptText) {
        void addConversation({
          role: "copilot",
          prompt: promptText,
          reply: t,
        }).catch((err) => console.error("[addConversation]", err));
      }
      await fetch("/api/match/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connId, matchId, action: "reply", text: t }),
      });
      // 1.5s 后回 idle
      setTimeout(() => {
        setCopilotState("idle");
        setCurrentPrompt(null);
      }, 1500);
    },
    [connId]
  );

  /**
   * Copilot 对当前 match 的 human 放大招
   * 只 POST，本地不渲染特效（特效在 human 端渲染）
   * 电量消耗由调用方决定（PlayClient 在 onUse 时 charge 一次）
   */
  const castUltimate = useCallback(
    async (skill: SkillId) => {
      const matchId = currentMatchRef.current;
      if (!matchId) return;
      await fetch("/api/match/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connId, matchId, action: "ultimate", skill }),
      });
    },
    [connId]
  );

  const promptInFlight = inflightPromptId !== null;

  return {
    connId,
    connected,
    // human
    messages,
    promptInFlight,
    sendPrompt,
    markTypingDone,
    // copilot
    copilotState,
    currentPrompt,
    countdown,
    answeredCount,
    startWaiting,
    cancelWaiting,
    accept,
    skip,
    reply,
    castUltimate,
  };
}
