"use client";

import { useEffect, useState } from "react";
import { PixelGPU } from "@/components/gpu/PixelGPU";

const THINKING_PHRASES = [
  "analyzing stack trace",
  "querying knowledge base",
  "running Monte Carlo simulation",
  "spinning up GPU tensor cores",
  "backtracking decision tree",
  "compressing latent space",
  "inferring intent from gibberish",
  "wait, what was the question?",
];

/**
 * Copilot 回答前的 thinking 样式 —— 模拟大模型推理过程
 * 像素显卡风扇狂转 + 灰色斜体循环短语 + 闪烁光标
 */
export function ThinkingIndicator({ fanSize = 14 }: { fanSize?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setI((v) => (v + 1) % THINKING_PHRASES.length);
    }, 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 py-2 text-[#008f00] text-sm">
      <PixelGPU fanSize={fanSize} fast />
      <span className="italic">// thinking... {THINKING_PHRASES[i]}</span>
      <span className="animate-cursor-blink text-[#00ff41]">▋</span>
    </div>
  );
}
