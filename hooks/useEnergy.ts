"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "yacb_energy_v3";

export type EnergyState = {
  /** 总单位数。每次充电 +1，放电 -1。10 单位 = 1 台备用手机。 */
  counter: number;
};

/** 出场自带 50% 电量（counter=5 = 50%，0 备用手机，不能放大招） */
const DEFAULT_STATE: EnergyState = { counter: 5 };

/**
 * 能量状态机 —— 整数 counter 模型
 *
 * 数学：
 *   devices              = floor(counter / 10) + 1   // 当前手机数（含在充的那台）
 *   backupDevices        = floor(counter / 10)         // 备用手机数（可借电/放大招）
 *   currentBatteryPercent = (counter % 10) * 10        // 当前手机电量百分比
 *
 * 操作：
 *   charge()    → counter += 1
 *   discharge() → counter -= 1（自然借电：减到跨手机边界时备用手机自动接续）
 *   useUltimate() → counter -= 10（消耗一台备用手机，触发特效）
 *
 * 关机：counter === 0 时玩家试图 discharge（既没备用手机也没当前电量）
 *
 * 持久化：LocalStorage key yacb_energy_v2
 */
export function useEnergy() {
  const [state, setState] = useState<EnergyState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let nextState = DEFAULT_STATE;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EnergyState>;
        if (typeof parsed.counter === "number" && parsed.counter >= 0) {
          nextState = { counter: Math.floor(parsed.counter) };
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    const id = setTimeout(() => {
      setState(nextState);
      setHydrated(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled */
    }
  }, [state, hydrated]);

  const charge = useCallback((units = 1) => {
    setState((s) => ({ counter: s.counter + units }));
  }, []);

  const discharge = useCallback((units = 1) => {
    setState((s) => ({ counter: Math.max(0, s.counter - units) }));
  }, []);

  const useUltimate = useCallback(() => {
    let ok = false;
    setState((s) => {
      if (Math.floor(s.counter / 10) === 0) return s;
      ok = true;
      return { counter: s.counter - 10 };
    });
    return ok;
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  // 派生值
  // devices 用 ceil：counter=0 → 0 台，counter=1~10 → 1 台（在充），counter=11~20 → 2 台（1 满 + 1 充）
  const counter = state.counter;
  const devices = Math.ceil(counter / 10);
  const backupDevices = Math.max(0, devices - 1);
  // 当前手机电量：counter=0 → 0%；counter>0 → 第 N 台的进度 10%~100%
  const currentBatteryPercent =
    counter === 0 ? 0 : (((counter - 1) % 10) + 1) * 10;
  const availableUltimates = backupDevices;
  const canUltimate = backupDevices > 0;

  return {
    state,
    hydrated,
    counter,
    devices,
    backupDevices,
    currentBatteryPercent,
    availableUltimates,
    canUltimate,
    willShutdown: counter === 0,
    charge,
    discharge,
    useUltimate,
    reset,
  };
}
