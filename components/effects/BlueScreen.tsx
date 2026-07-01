"use client";

import { useEffect, useMemo } from "react";

/**
 * Windows 蓝屏全屏覆盖（4s 自毁）
 * Stop code 用程序员梗
 */
export function BlueScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  // 假二维码（随机像素方格）
  const qrCells = useMemo(
    () =>
      Array.from({ length: 144 }).map(() =>
        Math.random() > 0.45 ? "#fff" : "transparent"
      ),
    []
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0078d7] text-white font-mono p-8 sm:p-16 flex flex-col justify-center animate-flicker">
      <div className="text-7xl sm:text-9xl mb-8 font-light leading-none">:(</div>
      <p className="text-base sm:text-xl mb-2 max-w-3xl leading-relaxed">
        Your PC ran into a problem and needs to restart. We&apos;re just
        collecting some error info, and then we&apos;ll restart for you.
      </p>
      <p className="text-sm sm:text-lg mt-3">100% complete</p>

      <div className="mt-10 flex flex-col sm:flex-row sm:items-end gap-6">
        <div className="grid grid-cols-12 grid-rows-12 gap-px w-40 h-40 sm:w-52 sm:h-52 bg-white/10 p-1">
          {qrCells.map((c, i) => (
            <div key={i} style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="text-sm leading-relaxed">
          <p>
            Stop code:{" "}
            <span className="font-bold">COPILOT_BULLSHIT_OVERFLOW</span>
          </p>
          <p>
            What failed: <span className="font-bold">copilot.exe</span>
          </p>
          <p className="text-xs opacity-80 mt-2">
            {"// a real AI would never let you see this screen"}
          </p>
        </div>
      </div>
    </div>
  );
}
