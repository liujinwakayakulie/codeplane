"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 简易 toast：调用 pushToast(msg) 显示一条 3s 自动消失的错误提示
 *
 * 用法：
 *   const toast = useErrorToast();
 *   toast("something failed");
 */
export function useErrorToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const push = (text: string) => {
    setMsg(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMsg(null), 3500);
  };

  const node = msg ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] border border-[#ff0033] bg-black px-4 py-2 text-xs text-[#ff0033] max-w-md text-center shadow-[0_0_20px_rgba(255,0,51,0.4)] animate-flicker">
      {msg}
    </div>
  ) : null;

  return { push, node };
}
