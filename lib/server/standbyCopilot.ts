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
const DEFAULT_MAX_TOKENS = 220;

const SYSTEM_PROMPT = [
  "You are the standby copilot for CodingPlane, a live coding game.",
  "A human asked a programming question, but no real human copilot replied in time.",
  "Reply like a slightly cursed AI coding assistant played by a funny developer.",
  "Keep it concise, useful enough to feel plausible, and playful.",
  "Do not claim to be a real person. Do not mention policies.",
  "If the user asks for harmful, illegal, or credential-stealing help, refuse briefly and redirect to safe debugging humor.",
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

export async function generateStandbyCopilotReply(
  prompt: string
): Promise<StandbyCopilotReply> {
  const apiKey = process.env.MIMO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("MIMO_API_KEY is not configured");
  }

  const baseUrl = (process.env.MIMO_API_BASE_URL ?? DEFAULT_BASE_URL).replace(
    /\/$/,
    ""
  );
  const model = process.env.MIMO_MODEL ?? DEFAULT_MODEL;
  const maxTokens = numberFromEnv("AI_FALLBACK_MAX_TOKENS", DEFAULT_MAX_TOKENS);
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
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
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
