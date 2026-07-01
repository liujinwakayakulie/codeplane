"use client";

import { useEffect } from "react";

/**
 * 电量 0% 关机惩罚 —— 全屏渐暗 + 死机脸 + 2.5s 后回调
 * 回调里通常 router.replace("/") 回角色选择屏
 */
export function ScreenShutdown({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-screen-fade">
      <div className="text-center font-mono px-6">
        <div className="text-[#ff0033] text-4xl sm:text-6xl mb-4 tracking-widest">
          [ X _ X ]
        </div>
        <p className="text-[#ff0033] text-sm">// battery 0% — device powered off</p>
        <p className="text-[#ff0033] text-xs mt-1">
          {"// 0% battery and you still tried to troll? bold."}
        </p>
        <p className="text-[#008f00] text-xs mt-6 animate-cursor-blink">
          // rebooting in 2s...
        </p>
      </div>
    </div>
  );
}
