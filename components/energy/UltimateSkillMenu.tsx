"use client";

import { SKILLS, type SkillId } from "@/lib/skills";

/**
 * 终极技能菜单
 * available > 0 时大招按钮亮起（绿色闪烁），可点击释放
 */
export function UltimateSkillMenu({
  available,
  onUse,
}: {
  available: number;
  onUse: (id: SkillId) => void;
}) {
  const canUse = available > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-t border-[#008f00] bg-black/60">
      <span className="text-xs text-[#008f00] mr-1">ultimates:</span>
      {SKILLS.map((s) => (
        <button
          key={s.id}
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
      ))}
      <span className="ml-auto text-[10px] text-[#008f00]">
        {`×${available} ready`}
      </span>
    </div>
  );
}
