"use client";

import { useState } from "react";
import { TypewriterText } from "./TypewriterText";
import { ThinkingIndicator } from "./ThinkingIndicator";

export type ChatRole = "human" | "copilot" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  /** 正在打字机输出；为 true 时用 TypewriterText */
  typing?: boolean;
  /** 显示 thinking 占位（仅 copilot 用），为 true 时忽略 text */
  thinking?: boolean;
};

const ROLE_STYLE: Record<ChatRole, { prefix: string; color: string }> = {
  human: { prefix: "guest", color: "#00ff41" },
  copilot: { prefix: "copilot", color: "#00ccff" },
  system: { prefix: "system", color: "#008f00" },
};

/**
 * 单条消息气泡
 * - thinking → ThinkingIndicator
 * - typing → TypewriterText 流式输出
 * - 否则静态文本（whitespace-pre-wrap 支持多行 ASCII 字符画）
 *
 * showFeedback：仅 Human 视角 + copilot 已完成的消息显示 👍/👎 讽刺按钮
 */
export function MessageBubble({
  msg,
  onTypingDone,
  showFeedback = false,
  onFeedback,
  selectMode = false,
  selected = false,
  onToggleSelect,
}: {
  msg: ChatMessage;
  onTypingDone?: (id: string) => void;
  showFeedback?: boolean;
  onFeedback?: (type: "up" | "down") => void;
  /** 多选分享模式：渲染左侧勾选框，隐藏 👍/👎 */
  selectMode?: boolean;
  /** 当前是否被勾选 */
  selected?: boolean;
  /** 切换勾选 */
  onToggleSelect?: (id: string) => void;
}) {
  const [given, setGiven] = useState<"up" | "down" | null>(null);

  if (msg.thinking) {
    return <ThinkingIndicator />;
  }

  const style = ROLE_STYLE[msg.role];
  // 多选模式下不显示 👍/👎
  const showButtons = !selectMode && showFeedback && !given;

  const body = (
    <div className="flex-1 min-w-0">
      <div className="flex gap-1">
        <span className="shrink-0 whitespace-nowrap">
          <span style={{ color: style.color }} className="font-bold">
            {style.prefix}@local
          </span>
          <span className="text-[#008f00]">:~$ </span>
        </span>
        <div
          className="flex-1 min-w-0 whitespace-pre-wrap"
          style={{ color: style.color }}
        >
          {msg.typing ? (
            <TypewriterText
              text={msg.text}
              onDone={() => onTypingDone?.(msg.id)}
            />
          ) : (
            msg.text
          )}
        </div>
      </div>

      {showButtons && (
        <div className="flex gap-3 ml-1 mt-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setGiven("up");
              onFeedback?.("up");
            }}
            className="text-[#008f00] hover:text-[#00ff41] transition-colors"
            title="点赞（不会真的发生任何事）"
          >
            👍 like
          </button>
          <button
            type="button"
            onClick={() => {
              setGiven("down");
              onFeedback?.("down");
            }}
            className="text-[#008f00] hover:text-[#ff0033] transition-colors"
            title="点踩（也不会真的发生任何事）"
          >
            👎 bury
          </button>
        </div>
      )}

      {given && (
        <div className="ml-1 mt-0.5 text-[10px] text-[#008f00]/70 italic">
          // {given === "up" ? "已记录到 /dev/null" : "已转发到 /dev/null"}
        </div>
      )}
    </div>
  );

  // 多选模式：左侧勾选框 + 整行可点击切换
  if (selectMode) {
    return (
      <div
        className={`py-1.5 text-sm leading-relaxed break-words cursor-pointer transition-colors ${
          selected ? "bg-[#00ff41]/5" : "hover:bg-[#00ff41]/[0.03]"
        }`}
        onClick={() => onToggleSelect?.(msg.id)}
        role="checkbox"
        aria-checked={selected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onToggleSelect?.(msg.id);
          }
        }}
      >
        <div className="flex gap-2 items-start">
          <span
            className={`shrink-0 select-none font-mono ${
              selected ? "text-[#00ff41]" : "text-[#008f00]"
            }`}
            aria-hidden
          >
            [{selected ? "x" : " "}]
          </span>
          {body}
        </div>
      </div>
    );
  }

  return <div className="py-1.5 text-sm leading-relaxed break-words">{body}</div>;
}
