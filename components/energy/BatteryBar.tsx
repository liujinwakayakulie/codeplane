"use client";

/**
 * 当前手机电量条
 * 颜色随电量变化：绿 → 黄 → 红
 * 低电量（<20%）红色脉冲
 */
export function BatteryBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v > 50 ? "#00ff41" : v > 20 ? "#ffcc00" : "#ff0033";
  const pulse = v > 0 && v <= 20;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#008f00] tracking-wider">BAT</span>
      <div className="relative w-20 h-3.5 border border-[#008f00] flex items-center px-px">
        <div
          className={pulse ? "animate-pulse-red" : ""}
          style={{
            width: `${v}%`,
            backgroundColor: color,
            transition: "width 0.4s ease, background-color 0.4s ease",
            height: "100%",
          }}
        />
        {/* 电极头 */}
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-[#008f00]" />
      </div>
      <span
        className={`text-[11px] tabular-nums ${pulse ? "animate-pulse-red" : ""}`}
        style={{ color }}
      >
        {String(v).padStart(3, " ")}%
      </span>
    </div>
  );
}
