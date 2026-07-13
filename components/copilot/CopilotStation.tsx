"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AsciiMacroMenu } from "@/components/terminal/AsciiMacroMenu";
import type { CopilotState, CurrentPrompt } from "@/hooks/useLiveMatch";

/**
 * Copilot 视角主体 —— 5 态任务卡
 *
 *   idle       →  [▶ 开始等待] + 已答统计
 *   waiting    →  // waiting for a human prompt... + [取消等待]
 *   received   →  问题（可滚）+ 30s 倒计时 + [✓ accept] [✗ skip]
 *   answering  →  问题（可滚）+ 颜文字 + 大招 + 输入提示 + 输入框（带 send）
 *   done       →  // sent.（1.5s 自动回 idle，由 hook 控制）
 *
 * answering 骨架和 human 的 TerminalChat 类似：
 *   上方滚动信息区 + 底部固定输入区（颜文字/大招/输入框都不滚）
 */
export function CopilotStation({
  state,
  currentPrompt,
  countdown,
  answeredCount,
  ultimateMenu,
  onStartWaiting,
  onCancelWaiting,
  onAccept,
  onSkip,
  onReply,
}: {
  state: CopilotState;
  currentPrompt: CurrentPrompt | null;
  countdown: number;
  answeredCount: number;
  /** answering 态的大招菜单插槽 */
  ultimateMenu?: ReactNode;
  onStartWaiting: () => void;
  onCancelWaiting: () => void;
  onAccept: () => void;
  onSkip: () => void;
  onReply: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 进入 answering 态时聚焦输入框
  useEffect(() => {
    if (state === "answering") {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [state]);

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    onReply(t);
    setInput("");
  };

  // 点击 ASCII 宏：把字符画注入 input 并 focus + 光标移到末尾
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

  // —— idle ——
  if (state === "idle") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-[10px] text-[#008f00]">
          {"// answered: "}
          <span className="text-[#00ff41]">{answeredCount}</span>
        </div>
        <button
          type="button"
          onClick={onStartWaiting}
          data-tour="start-waiting"
          className="group relative border-2 border-[#00ccff] text-[#00ccff] px-10 py-6 hover:translate-y-[-2px] transition-all"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[#00ccff] transition-opacity" />
          <div className="relative text-xl font-bold tracking-widest">
            [ ▶ start waiting ]
          </div>
          <div className="relative text-xs mt-2 opacity-70 group-hover:opacity-100">
            pick up human prompts, fake being an AI
          </div>
        </button>
        <p className="text-[10px] text-[#008f00] text-center max-w-xs leading-relaxed">
          {"// answering costs 0 battery, you actually gain +1 (charge)"}
          <br />
          {"// ignoring a prompt for 30s auto-skips it"}
        </p>
      </div>
    );
  }

  // —— waiting ——
  if (state === "waiting") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-sm text-[#00ccff] animate-pulse">
          {"// waiting for a human prompt"}
          <span className="inline-block ml-1 animate-flicker">_</span>
        </div>
        <button
          type="button"
          onClick={onCancelWaiting}
          className="text-xs text-[#008f00] hover:text-[#ff0033] transition-colors"
        >
          ✕ cancel waiting
        </button>
      </div>
    );
  }

  // —— done ——
  if (state === "done") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8">
        <div className="text-sm text-[#00ff41] animate-flicker">
          {"// sent. answered: "}
          {answeredCount}
        </div>
        <div className="text-[10px] text-[#008f00]">
          {"// returning to idle..."}
        </div>
      </div>
    );
  }

  if (!currentPrompt) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#008f00] text-xs">
        {"// state="}
        {state}
        {" but no prompt — bug"}
      </div>
    );
  }

  // —— received / answering：上方滚动问题，必要操作贴近问题区 ——

  // 问题卡（可单独抽组件，但只这两处用，内联）
  const promptCard = (
    <div className="border border-[#008f00] p-3 bg-black">
      <div className="text-[10px] text-[#008f00] mb-1">
        {"// prompt from human"}
      </div>
      <div className="flex gap-1 text-sm leading-relaxed break-words">
        <span className="shrink-0 whitespace-nowrap">
          <span className="text-[#00ff41] font-bold">guest@local</span>
          <span className="text-[#008f00]">:~$ </span>
        </span>
        <span className="text-[#00ff41] whitespace-pre-wrap flex-1 min-w-0">
          {currentPrompt.text}
        </span>
      </div>
    </div>
  );

  if (state === "received") {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
          {promptCard}
          <div className="-mt-px border-x border-b border-[#008f00] bg-black px-3 py-2 flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={onAccept}
              className="border border-[#00ff41] text-[#00ff41] px-3 py-1.5 hover:bg-[#00ff41]/10 transition-colors"
            >
              ✓ accept
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="border border-[#008f00] text-[#008f00] px-3 py-1.5 hover:text-[#ff0033] hover:border-[#ff0033]/50 transition-colors"
            >
              ✗ skip
            </button>
            <span
              className={`ml-auto tabular-nums text-xs ${
                countdown <= 5
                  ? "text-[#ff0033] animate-pulse"
                  : "text-[#008f00]"
              }`}
            >
              ⏱ {countdown}s
            </span>
          </div>
        </div>
      </div>
    );
  }

  // state === "answering"
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 问题（可滚） */}
      <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">{promptCard}</div>

      {/* 颜文字 */}
      <AsciiMacroMenu onPick={handlePickMacro} />

      {/* 大招 */}
      {ultimateMenu}

      {/* 输入提示 */}
      <div className="px-3 pt-1 text-[10px] text-[#008f00]">
        {"// your reply (Enter = newline, send button to fire)"}
      </div>

      {/* 输入框 + send */}
      <div className="border-t border-[#008f00] px-3 py-2 flex items-stretch gap-2 shrink-0">
        <span className="text-[#00ccff] pt-0.5 select-none">$</span>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="// fake AI reply..."
          rows={6}
          className="flex-1 bg-transparent outline-none text-[#00ccff] placeholder:text-[#008f00]/60 text-sm leading-relaxed resize-none overflow-y-auto"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="self-stretch px-4 text-xs border border-[#00ccff] text-[#00ccff] hover:bg-[#00ccff]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↵ send
        </button>
      </div>
    </div>
  );
}
