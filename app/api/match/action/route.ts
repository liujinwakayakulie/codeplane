import { matcher } from "@/lib/server/matcher";
import type { SkillId } from "@/lib/skills";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_SKILLS: SkillId[] = ["blue-screen", "code-rain", "cpu-melt"];

/**
 * Copilot 对局操作：accept / skip / reply / ultimate
 * body: { connId, matchId, action, text?, skill? }
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    connId?: string;
    matchId?: string;
    action?: "accept" | "skip" | "reply" | "ultimate";
    text?: string;
    skill?: SkillId;
  };

  const { connId, matchId, action } = body;
  if (!connId || !matchId || !action) {
    return Response.json(
      { ok: false, error: "missing connId/matchId/action" },
      { status: 400 }
    );
  }

  if (action === "accept") {
    matcher.accept(matchId, connId);
  } else if (action === "skip") {
    matcher.skip(matchId, connId);
  } else if (action === "reply") {
    const text = (body.text ?? "").trim();
    if (!text) {
      return Response.json({ ok: false, error: "empty reply" }, { status: 400 });
    }
    matcher.reply(matchId, connId, text.slice(0, 4000));
  } else if (action === "ultimate") {
    const skill = body.skill;
    if (!skill || !VALID_SKILLS.includes(skill)) {
      return Response.json({ ok: false, error: "invalid skill" }, { status: 400 });
    }
    matcher.castUltimate(matchId, connId, skill);
  } else {
    return Response.json({ ok: false, error: "unknown action" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
