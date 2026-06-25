"use client";

import { useEffect } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";

/**
 * 打字机文本 —— 流式输出，结束后回调
 */
export function TypewriterText({
  text,
  speed = 30,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const { output, done } = useTypewriter(text, speed);

  useEffect(() => {
    if (done) onDone?.();
  }, [done, onDone]);

  return (
    <span>
      {output}
      {!done && <span className="animate-cursor-blink">▋</span>}
    </span>
  );
}
