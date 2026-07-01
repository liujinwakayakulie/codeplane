/**
 * 大招元数据
 * 每个大招对应一个全屏视觉熔断特效，时长由 durationMs 控制
 */
export type SkillId = "blue-screen" | "code-rain" | "cpu-melt";

export type Skill = {
  id: SkillId;
  label: string;
  description: string;
  durationMs: number;
};

export const SKILLS: Skill[] = [
  {
    id: "blue-screen",
    label: "[BLUESCREEN]",
    description: "Windows BSOD — the copilot classic finisher",
    durationMs: 4000,
  },
  {
    id: "code-rain",
    label: "[CODERAIN]",
    description: "DOM collapses into Matrix code rain",
    durationMs: 6000,
  },
  {
    id: "cpu-melt",
    label: "[CPUMELT]",
    description: "CPU overload red flash — GPU takes off",
    durationMs: 3000,
  },
];

export const SKILL_MAP: Record<SkillId, Skill> = SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<SkillId, Skill>
);
