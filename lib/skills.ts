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
    label: "[蓝屏]",
    description: "Windows 蓝屏死机 — Copilot 经典反杀",
    durationMs: 4000,
  },
  {
    id: "code-rain",
    label: "[代码雨]",
    description: "DOM 像代码雨塌陷 — Matrix 致敬",
    durationMs: 6000,
  },
  {
    id: "cpu-melt",
    label: "[CPU熔断]",
    description: "CPU 过载红闪 — 显卡起飞",
    durationMs: 3000,
  },
];

export const SKILL_MAP: Record<SkillId, Skill> = SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<SkillId, Skill>
);
