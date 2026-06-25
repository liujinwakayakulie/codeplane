"use client";

/**
 * 像素风显卡（致敬 NVIDIA RTX 2080 Founders Edition）
 * 横向矩形外壳 + 中间两个圆形轴流风扇，每个风扇 3 片扇叶旋转
 *
 * active=false 时风扇停转（关机态/省电）
 */
export function PixelGPU({
  fanSize = 18,
  active = true,
  fast = false,
  className = "",
}: {
  fanSize?: number;
  active?: boolean;
  fast?: boolean;
  className?: string;
}) {
  const width = fanSize * 2.7;
  const height = fanSize * 1.45;
  const animClass = active
    ? fast
      ? "animate-fan-spin-fast"
      : "animate-fan-spin"
    : "";

  return (
    <div
      className={`relative border border-[#00ff41] bg-[#001500] flex items-center justify-center gap-1.5 ${className}`}
      style={{ width, height }}
      aria-hidden
    >
      {/* 左右挡板装饰（PCB 边缘） */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/4 bg-[#008f00]" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-3/4 bg-[#008f00]" />

      <Fan size={fanSize} animClass={animClass} />
      <Fan size={fanSize} animClass={animClass} />
    </div>
  );
}

function Fan({ size, animClass }: { size: number; animClass: string }) {
  return (
    <div
      className="relative rounded-full border border-[#008f00]"
      style={{ width: size, height: size, backgroundColor: "#000" }}
    >
      {/* 旋转的扇叶层 */}
      <div
        className={`absolute inset-0 ${animClass}`}
        style={{ transformOrigin: "center center" }}
      >
        {[0, 120, 240].map((deg) => (
          <div
            key={deg}
            className="absolute left-1/2 top-1/2"
            style={{
              width: size * 0.45,
              height: size * 0.22,
              backgroundColor: "#008f00",
              transform: `translate(0, -50%) rotate(${deg}deg)`,
              transformOrigin: "left center",
              clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 70%)",
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      {/* 中心轴 */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
        style={{
          width: size * 0.22,
          height: size * 0.22,
          backgroundColor: "#00ff41",
          boxShadow: "0 0 4px #00ff41",
        }}
      />
    </div>
  );
}
