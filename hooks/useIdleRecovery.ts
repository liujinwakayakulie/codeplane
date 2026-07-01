"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 挂机兜底电量 + 状态暴露给 UI
 *
 * 每 2 分钟（INTERVAL_MS）+1 unit（=10%），每天本地时区自然日最多 10 次（MAX_PER_DAY）= 100%
 *
 * 对外暴露：
 *   - recoveredToday: 今天已恢复次数
 *   - remainingToday: 今天剩余次数
 *   - nextInMs: 距离下次恢复的毫秒数（满了之后是 0）
 *
 * 持久化：localStorage key yacb_recovery_v1，结构 { date, recovered }
 * 跨日自动重置。不补偿离线时间——纯挂机兜底。
 */

const RECOVERY_KEY = "yacb_recovery_v1";
const INTERVAL_MS = 2 * 60 * 1000;
const MAX_PER_DAY = 10;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type StoredState = { date: string; recovered: number };

function load(): StoredState {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<StoredState>;
      if (typeof p.date === "string" && typeof p.recovered === "number") {
        if (p.date === todayKey()) return p as StoredState;
        return { date: todayKey(), recovered: 0 };
      }
    }
  } catch {
    /* corrupt */
  }
  return { date: todayKey(), recovered: 0 };
}

function save(state: StoredState) {
  try {
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(state));
  } catch {
    /* storage disabled / full */
  }
}

export function useIdleRecovery(onRecover: () => void) {
  const cbRef = useRef(onRecover);
  useEffect(() => {
    cbRef.current = onRecover;
  });

  // SSR 用 0（默认值），client mount 后再从 localStorage 读真实值，避免 hydration mismatch
  const [recoveredToday, setRecoveredToday] = useState<number>(0);
  const [nextInMs, setNextInMs] = useState<number>(INTERVAL_MS);

  // ref 持有"上次触发时间"和"上次已知 recovered"，避免 effect 依赖 state 重建 interval
  const lastRecoverAtRef = useRef<number>(0);
  const knownRecoveredRef = useRef<number>(0);

  useEffect(() => {
    // 首次进 effect 时：
    // 1) 从 localStorage 加载真实 recovered 值（client only）
    // 2) 初始化 lastRecoverAt（render 期不能调 Date.now()）
    const fresh = load();
    setRecoveredToday(fresh.recovered);
    knownRecoveredRef.current = fresh.recovered;
    lastRecoverAtRef.current = Date.now();

    const id = setInterval(() => {
      const fresh = load();
      const known = knownRecoveredRef.current;

      // 跨日重置：localStorage 里已经清零，但内存里还记着昨天的数
      if (fresh.recovered < known) {
        knownRecoveredRef.current = fresh.recovered;
        setRecoveredToday(fresh.recovered);
        lastRecoverAtRef.current = Date.now();
        setNextInMs(fresh.recovered >= MAX_PER_DAY ? 0 : INTERVAL_MS);
        return;
      }

      // 同步外部改动（其它 tab 也在跑）
      if (fresh.recovered > known) {
        knownRecoveredRef.current = fresh.recovered;
        setRecoveredToday(fresh.recovered);
      }

      // 已满
      if (fresh.recovered >= MAX_PER_DAY) {
        setNextInMs(0);
        return;
      }

      // 正常倒计时
      const elapsed = Date.now() - lastRecoverAtRef.current;
      const remaining = INTERVAL_MS - elapsed;

      if (remaining <= 0) {
        cbRef.current();
        const newRecovered = fresh.recovered + 1;
        save({ date: fresh.date, recovered: newRecovered });
        knownRecoveredRef.current = newRecovered;
        lastRecoverAtRef.current = Date.now();
        setRecoveredToday(newRecovered);
        setNextInMs(newRecovered >= MAX_PER_DAY ? 0 : INTERVAL_MS);
      } else {
        setNextInMs(remaining);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    recoveredToday,
    remainingToday: Math.max(0, MAX_PER_DAY - recoveredToday),
    nextInMs: recoveredToday >= MAX_PER_DAY ? 0 : nextInMs,
    maxPerDay: MAX_PER_DAY,
  };
}

/** 把毫秒格式化成 M:SS 倒计时字符串 */
export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
