/**
 * AI 模型谐音梗库 —— 讽刺 Cursor 等 AI IDE 的模型选择器
 *
 * 命名原则：英文谐音梗，能看出调侃的是谁，但跟原名不一样（避免商标问题）
 * multiplier：token 消耗倍率，故意用搞笑小数
 */

export type AIModel = {
  id: string;
  /** 谐音梗展示名（含版本号恶搞） */
  name: string;
  /** 调侃对象（小字提示，让玩家秒懂） */
  parody: string;
  /** token 消耗倍率 */
  multiplier: number;
  /** 搞笑标语 */
  tagline: string;
};

export const AI_MODELS: AIModel[] = [
  {
    id: "clod",
    name: "Clod 3.5 Sushi",
    parody: "← Claude",
    multiplier: 4.2,
    tagline: "I cannot lie, this model is mid",
  },
  {
    id: "jpt",
    name: "JPT-Fore",
    parody: "← GPT-4",
    multiplier: 3.7,
    tagline: "Just Predicting Tokens, poorly",
  },
  {
    id: "glum",
    name: "Glum-4",
    parody: "← GLM-4",
    multiplier: 2.3,
    tagline: "always sad, sometimes right",
  },
  {
    id: "deepsick",
    name: "DeepSick-V3",
    parody: "← DeepSeek-V3",
    multiplier: 5.5,
    tagline: "deeply sick of training data",
  },
  {
    id: "jeminai",
    name: "Jeminai 2.0",
    parody: "← Gemini 2.0",
    multiplier: 4.8,
    tagline: "gem in eye, can't see a thing",
  },
  {
    id: "kimchi",
    name: "Kimchi Pro",
    parody: "← Kimi",
    multiplier: 1.9,
    tagline: "fermented context window",
  },
];

export const DEFAULT_MODEL_ID = "clod";
