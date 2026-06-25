"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/components/terminal/MessageBubble";

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

export function useLiveMatch() {
  const [connId] = useState(getOrCreateConnId);
  const [connected, setConnected] = useState(false);

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

    es.addEventListener("open", onOpen);
    es.addEventListener("error", onError);
    es.addEventListener("connected", onConnected as EventListener);
    es.addEventListener("human:matching", onHumanMatching as EventListener);
    es.addEventListener("human:matched", onHumanMatched as EventListener);
    es.addEventListener("human:reply", onHumanReply as EventListener);
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
      if (!t || !matchId) return;
      setCopilotState("done");
      setAnsweredCount((n) => n + 1);
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
  };
}
