"use client";

type PhoneState = "empty" | "charged" | "charging";

/**
 * 像素风手机图标
 * empty    = 占位（counter=0 时也显示一台，让用户有视觉锚点，暗灰无填充）
 * charged  = 备用手机（满电可放大招，亮绿 + 屏幕填充 + 发光）
 * charging = 当前在充（暗框 + 闪烁屏幕）
 */
function PixelPhone({ state }: { state: PhoneState }) {
  const color =
    state === "charged"
      ? "#00ff41"
      : state === "charging"
      ? "#008f00"
      : "#003f00";
  const screenBg = state === "charged" ? color : "transparent";
  const screenOpacity = state === "charging" ? 0.6 : state === "empty" ? 0.3 : 1;
  const glow = state === "charged" ? `0 0 5px ${color}` : "none";

  return (
    <span
      className="inline-flex flex-col items-center justify-between box-content"
      style={{
        width: 9,
        height: 15,
        border: `1px solid ${color}`,
        padding: "1px 0",
        boxShadow: glow,
        transition: "all 0.3s",
      }}
      title={state}
    >
      {/* 听筒 */}
      <span style={{ width: 4, height: 1, backgroundColor: color }} />
      {/* 屏幕 */}
      <span
        className={state === "charging" ? "animate-cursor-blink" : ""}
        style={{
          width: 6,
          height: 7,
          border: `1px solid ${color}`,
          backgroundColor: screenBg,
          opacity: screenOpacity,
        }}
      />
      {/* home 键 */}
      <span style={{ width: 3, height: 1, backgroundColor: color }} />
    </span>
  );
}

/**
 * 已累积手机标记栏
 * count = devices（含当前在充）；最后一台 charging，其它 charged
 * count = 0 时显示 1 台 empty 占位（不显示空），方便用户看到"该充电了"
 */
export function DeviceBadges({ count }: { count: number }) {
  const displayCount = Math.max(count, 1);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#008f00] tracking-wider">DEVS</span>
      <div className="flex items-end gap-1 min-h-[17px]">
        {Array.from({ length: displayCount }).map((_, i) => {
          let state: PhoneState;
          if (count === 0) {
            state = "empty";
          } else if (i === count - 1) {
            state = "charging";
          } else {
            state = "charged";
          }
          return <PixelPhone key={i} state={state} />;
        })}
      </div>
      <span className="text-[10px] text-[#008f00] tabular-nums">×{count}</span>
    </div>
  );
}
