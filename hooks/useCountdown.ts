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
  const stateKey = `${roundKey}:${seconds}`;
  const [state, setState] = useState({ key: stateKey, remaining: seconds });
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.max(0, Math.ceil(seconds - elapsed));
      setState({ key: stateKey, remaining: next });
      if (next <= 0) {
        clearInterval(id);
        onEndRef.current?.();
      }
    }, 100);
    return () => clearInterval(id);
  }, [active, seconds, stateKey]);

  return { remaining: state.key === stateKey ? state.remaining : seconds };
}
