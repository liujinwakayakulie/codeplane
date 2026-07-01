"use client";

import { useEffect, useRef } from "react";

/**
 * 挂机兜底电量：每 2 分钟 +1 unit（= 10%），每天（本地时区自然日）最多 10 次
 *
 * 用途：玩家把电量耗光后挂机也能爬回来，但不无限增长、不跨日累积、不补偿离线时间
 *
 * 持久化：localStorage key yacb_recovery_v1，结构 { date: "YYYY-MM-DD", recovered: number }
 * 跨日自动重置 recovered=0
 *
 * 计时只在页面开着时跑，关页就停。不补偿用户离开期间的时间。
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

type RecoveryState = { date: string; recovered: number };

function load(): RecoveryState {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<RecoveryState>;
      if (typeof p.date === "string" && typeof p.recovered === "number") {
        // 跨日重置
        if (p.date === todayKey()) return p as RecoveryState;
        return { date: todayKey(), recovered: 0 };
      }
    }
  } catch {
    /* corrupt */
  }
  return { date: todayKey(), recovered: 0 };
}

function save(state: RecoveryState) {
  try {
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(state));
  } catch {
    /* storage disabled / full */
  }
}

export function useIdleRecovery(onRecover: () => void) {
  // 用 ref 持有最新 callback，避免 effect 重建 interval
  const cbRef = useRef(onRecover);
  useEffect(() => {
    cbRef.current = onRecover;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const state = load();
      if (state.recovered >= MAX_PER_DAY) return;
      cbRef.current();
      state.recovered += 1;
      save(state);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}

/** 暴露当前状态供 UI 展示（剩余次数等），不强制要求用 */
export function getIdleRecoveryState(): RecoveryState {
  return load();
}
