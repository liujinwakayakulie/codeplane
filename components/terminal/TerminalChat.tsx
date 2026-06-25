"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { MessageBubble, type ChatMessage } from "./MessageBubble";
import { AsciiMacroMenu } from "./AsciiMacroMenu";

const FEEDBACK_UP_MSGS = [
  "👍 Thanks! Your feedback was sent directly to /dev/null.",
  "👍 Noted. We definitely didn't immediately discard this.",
  "👍 Logged. Will be reviewed by our /dev/null team within 0 business days.",
  "👍 Thank you for your valuable feedback. It has been incinerated.",
  "👍 Your thumbs up is now permanently etched into /dev/null.",
];

const FEEDBACK_DOWN_MSGS = [
  "👎 Complaint forwarded to /dev/null. Expect a reply never.",
  "👎 We hear you. We just don't care enough to do anything.",
  "👎 Your thumbs down has been added to the void.",
  "👎 This feedback will be reviewed by our AI, which is also broken.",
  "👎 Noted. We've already forgotten.",
];

/**
 * 终端对线主区域（受控组件）
 * 布局：消息区 flex-1 滚动 + [模型选择栏（human） / ASCII 菜单（copilot）] + 大招菜单插槽 + 多行输入框
 *
 * 内置反馈 toast：MessageBubble 上报 👍/👎 后，底部弹讽刺文案 3s 后消失
 * Copilot 视角点击 ASCII 宏后自动 focus 输入框，光标移到末尾
 */
export function TerminalChat({
  role,
  messages,
  onSend,
  onTypingDone,
  ultimateMenu,
  modelSelector,
  selectMode = false,
  selectedIds,
  onToggleSelect,
  onExitSelectMode,
}: {
  role: "human" | "copilot";
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onTypingDone: (id: string) => void;
  ultimateMenu?: ReactNode;
  modelSelector?: ReactNode;
  /** 多选分享模式：左侧勾选框 + 隐藏 👍/👎 */
  selectMode?: boolean;
  /** 多选模式下被勾中的 message id 集合 */
  selectedIds?: Set<string>;
  /** 切换某条消息的勾选 */
  onToggleSelect?: (id: string) => void;
  /** 退出多选模式（Esc / 外部取消） */
  onExitSelectMode?: () => void;
}) {
  const [input, setInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleFeedback = useCallback((type: "up" | "down") => {
    const pool = type === "up" ? FEEDBACK_UP_MSGS : FEEDBACK_DOWN_MSGS;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // 多选模式下按 Esc 退出
  useEffect(() => {
    if (!selectMode || !onExitSelectMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onExitSelectMode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectMode, onExitSelectMode]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  // 点击 ASCII 宏后注入字符画，并自动 focus 输入框 + 光标移到末尾
  // 用 RAF 等 React 渲染完 textarea（新 value 已写入 DOM），再读 value.length 定位光标
  const handlePickMacro = (art: string) => {
    setInput((p) => p + art);
    requestAnimationFrame(() => {
      const ta = inputRef.current;
      if (!ta) return;
      ta.focus();
      const end = ta.value.length;
      ta.setSelectionRange(end, end);
    });
  };

  const placeholder =
    role === "copilot"
      ? "// 反串回答（Enter 换行，点 send 发送，电量 +1）"
      : "// 提问（Enter 换行，点 send 发送，电量 -1）";

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* 消息区（滚动） */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            onTypingDone={onTypingDone}
            showFeedback={
              !selectMode &&
              role === "human" &&
              m.role === "copilot" &&
              !m.typing
            }
            onFeedback={handleFeedback}
            selectMode={selectMode}
            selected={selectedIds?.has(m.id) ?? false}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>

      {/* 模型选择栏（human 视角，IDE 讽刺） */}
      {modelSelector}

      {/* ASCII 菜单（copilot only） */}
      {role === "copilot" && <AsciiMacroMenu onPick={handlePickMacro} />}

      {/* 大招菜单插槽（copilot only） */}
      {ultimateMenu}

      {/* 输入框（多行 textarea，6 行，Enter 换行 / 右侧 send 按钮发送） */}
      <div className="border-t border-[#008f00] px-3 py-2 flex items-stretch gap-2 shrink-0">
        <span className="text-[#00ff41] pt-0.5 select-none">$</span>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="flex-1 bg-transparent outline-none text-[#00ff41] placeholder:text-[#008f00]/60 text-sm leading-relaxed resize-none overflow-y-auto"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="self-stretch px-4 text-xs border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↵ send
        </button>
      </div>

      {/* 反馈 toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 border border-[#00ff41] bg-black px-4 py-2 text-xs text-[#00ff41] max-w-md text-center shadow-[0_0_20px_rgba(0,255,65,0.4)] animate-flicker">
          {toast}
        </div>
      )}
    </div>
  );
}
