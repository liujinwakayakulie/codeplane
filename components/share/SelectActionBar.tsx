"use client";

/**
 * 多选分享模式下的操作条
 * 渲染在 /play 消息区上方（header 与 TerminalChat 之间）
 *
 * 显示：已选 N / 共 M 条 · 全选/全不选 · 取消 · 📸 生成截图
 */
export function SelectActionBar({
  selectedCount,
  totalCount,
  busy,
  onSelectAll,
  onSelectNone,
  onCancel,
  onExport,
}: {
  selectedCount: number;
  totalCount: number;
  busy: boolean;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onCancel: () => void;
  onExport: () => void;
}) {
  const allSelected = selectedCount === totalCount;
  return (
    <div className="shrink-0 flex flex-wrap items-center gap-3 px-3 py-1.5 border-y border-[#00ccff]/50 bg-[#00ccff]/5 text-[11px]">
      <span className="text-[#00ccff] tabular-nums">
        {`${selectedCount} / ${totalCount} selected`}
      </span>
      <button
        type="button"
        onClick={allSelected ? onSelectNone : onSelectAll}
        className="text-[#008f00] hover:text-[#00ff41] transition-colors"
      >
        {allSelected ? "select none" : "select all"}
      </button>
      <span className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-[#008f00] hover:text-[#ff0033] transition-colors"
        >
          ✕ cancel (esc)
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={busy}
          className="text-[#00ccff]/80 hover:text-[#00ccff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? "📸 ..." : "📸 export png"}
        </button>
      </span>
    </div>
  );
}
