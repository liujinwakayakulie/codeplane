"use client";

import { useEffect, useState } from "react";
import {
  HUMAN_TOUR_STEPS,
  COPILOT_TOUR_STEPS,
  isOnboarded,
  markOnboarded,
  type TourStep,
} from "@/lib/tour";

/**
 * Spotlight 式引导
 *
 * 实现要点：
 *   - 半透明全屏遮罩用 box-shadow 模拟"挖洞"
 *   - 高亮 rect 跟着 target 走，监听 resize/scroll 重新计算
 *   - 找不到 target 时降级为居中对话框
 *   - 首次访问该角色（human 或 copilot）跑一次，看完写 localStorage
 */
export function OnboardingTour({ role }: { role: "human" | "copilot" }) {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] =
    role === "human" ? HUMAN_TOUR_STEPS : COPILOT_TOUR_STEPS;

  // mount 后短暂延迟启动（等页面渲染稳定）
  useEffect(() => {
    if (isOnboarded(role)) return;
    const t = setTimeout(() => setStep(0), 600);
    return () => clearTimeout(t);
  }, [role]);

  // 跟踪当前 target 的 rect
  useEffect(() => {
    if (step === null) return;
    const cur = steps[step];
    if (!cur) return;

    const update = () => {
      const el = document.querySelector(cur.target);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    // 短延迟再算一次，等可能的 layout shift 稳定
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step, steps]);

  if (step === null) return null;
  const cur = steps[step];
  if (!cur) return null;

  const next = () => {
    if (step + 1 >= steps.length) {
      markOnboarded(role);
      setStep(null);
    } else {
      setStep(step + 1);
    }
  };
  const skip = () => {
    markOnboarded(role);
    setStep(null);
  };

  // 气泡定位：默认在 target 下方 12px，水平居中于 target；贴边时滑入
  const bubbleWidth = 300;
  const bubbleLeft = rect
    ? Math.max(
        12,
        Math.min(
          rect.left + rect.width / 2 - bubbleWidth / 2,
          window.innerWidth - bubbleWidth - 12
        )
      )
    : window.innerWidth / 2 - bubbleWidth / 2;
  const bubbleTop = rect
    ? rect.bottom + 12 + window.scrollY > window.innerHeight - 200
      ? Math.max(12, rect.top - 12 - 160) // 没空间放下方就放上方
      : rect.bottom + 12
    : window.innerHeight / 2 - 80;

  return (
    <>
      {/* Spotlight：用 box-shadow 模拟挖洞遮罩 */}
      {rect && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: 4,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.78)",
            border: "2px solid #00ff41",
            pointerEvents: "none",
            zIndex: 9990,
            transition: "all 0.18s ease",
          }}
        />
      )}
      {!rect && (
        // target 没找到时，至少给一个半透明背板让气泡可读
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            zIndex: 9990,
            pointerEvents: "none",
          }}
        />
      )}

      {/* 气泡 */}
      <div
        role="dialog"
        aria-label={cur.title}
        style={{
          position: "fixed",
          top: bubbleTop,
          left: bubbleLeft,
          width: bubbleWidth,
          zIndex: 9991,
          background: "#000",
          border: "1px solid #00ff41",
          boxShadow: "0 0 20px rgba(0,255,65,0.3)",
          padding: 14,
          fontFamily:
            "var(--font-jetbrains-mono), ui-monospace, 'Cascadia Code', monospace",
          color: "#00ff41",
        }}
      >
        <div
          style={{
            color: "#00ccff",
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 6,
            letterSpacing: 1,
          }}
        >
          {`# ${cur.title}`}
        </div>
        <div style={{ color: "#00ff41", fontSize: 12, lineHeight: 1.55 }}>
          {cur.body}
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#008f00", fontSize: 10 }}>
            {`${step + 1} / ${steps.length}`}
          </span>
          <span style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={skip}
              style={{
                background: "transparent",
                border: "1px solid #008f00",
                color: "#008f00",
                padding: "4px 8px",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              skip
            </button>
            <button
              type="button"
              onClick={next}
              style={{
                background: "transparent",
                border: "1px solid #00ff41",
                color: "#00ff41",
                padding: "4px 10px",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {step + 1 >= steps.length ? "done" : "next →"}
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
