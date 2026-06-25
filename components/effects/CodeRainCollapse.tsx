"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "01ｱｲｳｴｵｶｷｸｹｺ<>{}[];:/\\|".split("");

/**
 * 代码雨塌陷（6s 自毁）
 * 阶段 1（0-2s）：Matrix 字符雨背景
 * 阶段 2（2-6s）：错误信息文字向下塌陷消失
 */
export function CodeRainCollapse({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"rain" | "collapse">("rain");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("collapse"), 2000);
    const t2 = setTimeout(onDone, 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = new Array(cols)
      .fill(0)
      .map(() => Math.random() * canvas.height);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillText(ch, i * fontSize, y);
        drops[i] = y > canvas.height && Math.random() > 0.975 ? 0 : y + fontSize;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className={`absolute inset-0 flex items-center justify-center text-[#00ff41] font-mono transition-all duration-[2500ms] ease-in ${
          phase === "collapse"
            ? "translate-y-[90vh] opacity-0 blur-md"
            : "translate-y-0 opacity-100"
        }`}
      >
        <pre className="text-xs sm:text-base leading-tight px-6">{`
> SESSION CORRUPTED
> FATAL: stack overflow at line 42
> copilot.dll not found
> cannot read property 'answer' of undefined
> aborting recovery...
> ▓▓▓▓▓▓▓▓▓▓░░░░░░ 67%
        `}</pre>
      </div>
    </div>
  );
}
