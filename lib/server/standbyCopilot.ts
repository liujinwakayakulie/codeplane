type MimoChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type StandbyCopilotReply = {
  text: string;
  model: string;
};

const DEFAULT_BASE_URL = "https://api.xiaomimimo.com/v1";
const DEFAULT_MODEL = "mimo-v2.5-pro";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_TOKENS = 260;
const DEFAULT_PROMPT_MAX_TOKENS = 180;

const SYSTEM_PROMPT = [
  "You are the standby copilot for CodingPlane, a live coding game.",
  "A human asked a programming question, but no real human copilot replied in time.",
  "Reply like a funny, lightly savage developer pretending to be an AI assistant.",
  "Keep it short: 1-3 sentences, ideally under 60 words.",
  "Be useful enough to pass, but add one dry roast or tiny jab.",
  "Match the user's language. Avoid markdown, long explanations, bullet lists, and corporate apology foam.",
  "Do not claim to be a real person. Do not mention policies or fallback systems.",
  "If the user asks for harmful, illegal, or credential-stealing help, refuse briefly and redirect to safe debugging humor.",
].join(" ");

const PROMPT_SYSTEM_PROMPT = [
  "You generate prompts for CodingPlane, a live coding game where a human copilot pretends to be AI.",
  "Write exactly one short prompt for the copilot to answer.",
  "Make it funny, dry, and lightly savage, like a tired developer asking for help.",
  "It may be about code, debugging, meetings, burnout, legacy systems, standups, estimates, interviews, or the absurdity of software work.",
  "Keep it under 140 characters. No quotes. No markdown. No explanation.",
  "Avoid slurs, hate, sexual content, and personal attacks on protected traits.",
].join(" ");

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function isStandbyCopilotConfigured(): boolean {
  return Boolean(process.env.MIMO_API_KEY?.trim());
}

export function getStandbyCopilotTimeoutMs(): number {
  return numberFromEnv("AI_FALLBACK_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
}

async function requestMimoText({
  messages,
  maxTokens,
  temperature,
}: {
  messages: Array<{ role: "system" | "user"; content: string }>;
  maxTokens: number;
  temperature: number;
}): Promise<StandbyCopilotReply> {
  const apiKey = process.env.MIMO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("MIMO_API_KEY is not configured");
  }

  const baseUrl = (process.env.MIMO_API_BASE_URL ?? DEFAULT_BASE_URL).replace(
    /\/$/,
    ""
  );
  const model = process.env.MIMO_MODEL ?? DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    getStandbyCopilotTimeoutMs()
  );

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => ({}))) as MimoChatResponse & {
      error?: { message?: string };
      message?: string;
    };

    if (!res.ok) {
      const message =
        data.error?.message ?? data.message ?? `Mimo request failed (${res.status})`;
      throw new Error(message);
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Mimo returned an empty reply");
    }

    return {
      text: text.slice(0, 4000),
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateStandbyCopilotReply(
  prompt: string
): Promise<StandbyCopilotReply> {
  const maxTokens = numberFromEnv("AI_FALLBACK_MAX_TOKENS", DEFAULT_MAX_TOKENS);
  return requestMimoText({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    maxTokens,
    temperature: 0.95,
  });
}

export async function generateStandbyHumanPrompt(): Promise<StandbyCopilotReply> {
  const maxTokens = numberFromEnv(
    "AI_PROMPT_MAX_TOKENS",
    DEFAULT_PROMPT_MAX_TOKENS
  );
  return requestMimoText({
    messages: [
      { role: "system", content: PROMPT_SYSTEM_PROMPT },
      {
        role: "user",
        content:
          "Generate one fresh CodingPlane prompt. Make it short, funny, and a little mean about programmer life.",
      },
    ],
    maxTokens,
    temperature: 1.05,
  });
}
