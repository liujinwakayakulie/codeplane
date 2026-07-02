"use client";

/**
 * SSE 断开超过一定时长（默认 3s）后渲染全屏遮罩
 *
 * EventSource 自带快速重连（几百 ms），短暂抖动不该打扰用户；
 * 但若 3s 还没回来，多半是真断网了，要让用户知道。
 */
export function ConnectionOverlay({
  visible,
}: {
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[9998] bg-black/85 flex flex-col items-center justify-center text-[#ff0033] animate-flicker pointer-events-none">
      <div className="text-2xl sm:text-3xl font-bold tracking-widest mb-3">
        {"// CONNECTION LOST"}
      </div>
      <div className="text-xs text-[#008f00]">
        {"// reconnecting... keep this tab open"}
      </div>
      <div className="text-[10px] text-[#008f00]/70 mt-6">
        {"// if it doesn't come back, check your network and refresh"}
      </div>
    </div>
  );
}
