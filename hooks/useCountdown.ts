"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 倒计时 hook
 * @param seconds 总秒数
 * @param roundKey 每轮重启 key（变化时重置并重新启动）
 * @param active 是否激活
 * @param onEnd 倒计时归零回调
 */
export function useCountdown(
  seconds: number,
  roundKey: number | string,
  active: boolean,
  onEnd?: () => void
) {
  const [remaining, setRemaining] = useState(seconds);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!active) return;
    setRemaining(seconds);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.max(0, Math.ceil(seconds - elapsed));
      setRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        onEndRef.current?.();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey, active]);

  return { remaining };
}
