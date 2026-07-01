"use client";

import { AI_MODELS } from "@/lib/models";

/**
 * AI IDE 模型选择栏（讽刺 Cursor / Windsurf 等）
 * 仅在 Human 视角显示 —— 讽刺"用 AI IDE 写代码的人"
 *
 * 横向可滚动按钮，当前选中高亮，每个按钮显示模型名 + token 倍率
 */
export function ModelSelector({
  currentId,
  onSelect,
}: {
  currentId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="border-t border-[#008f00] px-3 py-2 bg-black/60 shrink-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] text-[#008f00] tracking-wider">MODEL</span>
        <span className="text-[9px] text-[#008f00]/60">
          {"// pick your \"AI assistant\" (higher burn = more mid)"}
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {AI_MODELS.map((m) => {
          const active = m.id === currentId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              title={`${m.tagline}\n(${m.multiplier}x token burn)`}
              className={`shrink-0 px-2 py-1 text-[10px] border transition-colors whitespace-nowrap ${
                active
                  ? "border-[#00ff41] text-[#00ff41] bg-[#00ff41]/10 shadow-[0_0_8px_rgba(0,255,65,0.3)]"
                  : "border-[#008f00] text-[#008f00] hover:text-[#00ff41] hover:border-[#00ff41]/50"
              }`}
            >
              {m.name}{" "}
              <span className="opacity-60">· {m.multiplier}x</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
