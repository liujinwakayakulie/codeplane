"use client";

import { SKILLS, type SkillId } from "@/lib/skills";

/**
 * 终极技能菜单
 * available > 0 时大招按钮亮起（绿色闪烁），可点击释放
 * ⚡force 是调试入口，跳过电量检查直接触发，方便调特效
 */
export function UltimateSkillMenu({
  available,
  onUse,
  onForce,
}: {
  available: number;
  onUse: (id: SkillId) => void;
  onForce: (id: SkillId) => void;
}) {
  const canUse = available > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-t border-[#008f00] bg-black/60">
      <span className="text-xs text-[#008f00] mr-1">大招:</span>
      {SKILLS.map((s) => (
        <div key={s.id} className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            disabled={!canUse}
            onClick={() => onUse(s.id)}
            title={s.description}
            className={`px-2 py-1 text-xs border transition-colors ${
              canUse
                ? "border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/15 animate-flicker"
                : "border-[#005f00] text-[#005f00] cursor-not-allowed"
            }`}
          >
            {s.label}
          </button>
          <button
            type="button"
            onClick={() => onForce(s.id)}
            title="强制触发（调试用，不消耗次数）"
            className="text-[9px] text-[#ffcc00]/60 hover:text-[#ffcc00] transition-colors"
          >
            ⚡force
          </button>
        </div>
      ))}
      <span className="ml-auto text-[10px] text-[#008f00]">
        可用 ×{available}
      </span>
    </div>
  );
}
