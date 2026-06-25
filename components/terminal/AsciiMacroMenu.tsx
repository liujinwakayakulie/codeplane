"use client";

import { ASCII_MACROS } from "@/lib/asciiArt";

/**
 * ASCII 字符画快捷栏
 * 45s 倒计时里的速攻武器，点击把字符画插入到输入框
 */
export function AsciiMacroMenu({
  onPick,
  disabled = false,
}: {
  onPick: (art: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2 px-3 py-2 border-t border-[#008f00] bg-black/60">
      <span className="text-xs text-[#008f00] self-center mr-1">
        macros:
      </span>
      {ASCII_MACROS.map((m) => (
        <button
          key={m.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(m.art)}
          className="px-2 py-1 text-xs border border-[#008f00] text-[#008f00] hover:bg-[#00ff41]/10 hover:text-[#00ff41] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
