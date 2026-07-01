/**
 * 大招元数据
 * 每个大招对应一个全屏视觉熔断特效，时长由 durationMs 控制
 * castMessage 是 human 端收到大招时塞进 messages 列表的调侃文案（特效消失后仍保留，方便截图）
 */
export type SkillId = "blue-screen" | "code-rain" | "cpu-melt";

export type Skill = {
  id: SkillId;
  label: string;
  description: string;
  durationMs: number;
  /** 推给 human 的 system 消息文案 */
  castMessage: string;
};

export const SKILLS: Skill[] = [
  {
    id: "blue-screen",
    label: "[BLUESCREEN]",
    description: "Windows BSOD — the copilot classic finisher",
    durationMs: 4000,
    castMessage: "💀 copilot cast [BLUE-SCREEN]. your session didn't survive.",
  },
  {
    id: "code-rain",
    label: "[CODERAIN]",
    description: "DOM collapses into Matrix code rain",
    durationMs: 6000,
    castMessage: "👾 copilot cast [CODE-RAIN]. wake up, neo.",
  },
  {
    id: "cpu-melt",
    label: "[CPUMELT]",
    description: "CPU overload red flash — GPU takes off",
    durationMs: 3000,
    castMessage: "🔥 copilot cast [CPU-MELT]. your fan just quit.",
  },
];

export const SKILL_MAP: Record<SkillId, Skill> = SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<SkillId, Skill>
);
