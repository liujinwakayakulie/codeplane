import { matcher } from "@/lib/server/matcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Copilot 对局操作：accept / skip / reply
 * body: { connId, matchId, action, text? }
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    connId?: string;
    matchId?: string;
    action?: "accept" | "skip" | "reply";
    text?: string;
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
  } else {
    return Response.json({ ok: false, error: "unknown action" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
