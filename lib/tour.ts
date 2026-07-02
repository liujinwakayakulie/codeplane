/**
 * Onboarding tour 步骤定义
 *
 * 每个 step 的 target 是 CSS selector（用 data-tour 属性锚定）
 * 引导仅在首次访问该角色时跑一次，看完标记 localStorage
 */

export type TourStep = {
  target: string;
  title: string;
  body: string;
};

export const HUMAN_TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='battery']",
    title: "battery",
    body:
      "your charge, shown as a %. asking a question costs -10%. answering as copilot gives +10%.",
  },
  {
    target: "[data-tour='idle']",
    title: "idle recovery",
    body:
      "if your tab is open and you're stuck at 0%, you trickle +10% every 2 minutes. up to +100% per day. just wait.",
  },
  {
    target: "[data-tour='role-switch']",
    title: "role switch",
    body:
      "stuck on the wrong side? this flips you between HUMAN and COPILOT. battery carries over.",
  },
  {
    target: "[data-tour='input']",
    title: "ask away",
    body:
      "type your question, hit send. it goes into the queue and a stranger picks it up. every round is a new stranger.",
  },
];

export const COPILOT_TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='start-waiting']",
    title: "start waiting",
    body:
      "click this to enter the queue. the server matches you with a stranger's question in real time.",
  },
  {
    target: "[data-tour='role-switch']",
    title: "role switch",
    body: "flip back to HUMAN anytime. battery carries over.",
  },
  {
    target: "[data-tour='idle']",
    title: "idle recovery",
    body:
      "same rule: +10% every 2 min if this tab is open. capped at +100% per day.",
  },
];

const ONBOARDED_KEY = "yacb_onboarded_v1";

export function isOnboarded(role: "human" | "copilot"): boolean {
  if (typeof window === "undefined") return true; // SSR 时不弹
  try {
    const raw = localStorage.getItem(ONBOARDED_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, boolean>;
      return p[role] === true;
    }
  } catch {
    /* corrupt */
  }
  return false;
}

export function markOnboarded(role: "human" | "copilot") {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ONBOARDED_KEY);
    const cur = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    cur[role] = true;
    localStorage.setItem(ONBOARDED_KEY, JSON.stringify(cur));
  } catch {
    /* storage disabled */
  }
}
