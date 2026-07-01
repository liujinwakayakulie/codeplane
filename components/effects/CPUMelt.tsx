"use client";

import { useEffect } from "react";

/**
 * CPU 熔断（3s 自毁）
 * 全屏红闪 + 过热警告 + 像素显卡风扇狂转
 */
export function CPUMelt({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] bg-red-950/50 backdrop-blur-sm flex items-center justify-center animate-pulse">
      <div className="text-center font-mono px-6">
        <div className="text-[#ff0033] text-4xl sm:text-7xl mb-4 animate-pulse">
          🔥 CPU 100% 🔥
        </div>
        <p className="text-[#ff0033] text-sm sm:text-base">
          {"// temp 99°C — fans have left the chat"}
        </p>
        <p className="text-[#ffcc00] text-xs sm:text-sm mt-2">
          // thermal throttling engaged
        </p>
        <p className="text-[#008f00] text-[10px] mt-8 animate-cursor-blink">
          // cooling down...
        </p>
      </div>
    </div>
  );
}
