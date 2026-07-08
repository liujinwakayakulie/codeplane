"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 打字机效果 hook —— 模拟大模型逐字流式输出
 * @param text 完整文本
 * @param speed 每字毫秒，默认 30ms
 * @param start 是否立即开始，默认 true
 *
 * 用法：
 *   const { output, done, skip } = useTypewriter("hello world");
 *   <span>{output}</span>
 *   skip() 可以一次性跳到末尾
 */
export function useTypewriter(text: string, speed = 30, start = true) {
  const [state, setState] = useState({
    text,
    output: start ? "" : text,
    done: !start,
  });
  const iRef = useRef(0);

  useEffect(() => {
    if (!start) return;
    iRef.current = 0;

    const id = setInterval(() => {
      iRef.current += 1;
      const done = iRef.current >= text.length;
      setState({
        text,
        output: text.slice(0, iRef.current),
        done,
      });
      if (iRef.current >= text.length) {
        clearInterval(id);
      }
    }, speed);

    return () => clearInterval(id);
  }, [text, speed, start]);

  const skip = () => {
    setState({ text, output: text, done: true });
  };

  const output = state.text === text ? state.output : start ? "" : text;
  const done = state.text === text ? state.done : !start;

  return { output, done, skip };
}
