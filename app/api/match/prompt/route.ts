import { matcher } from "@/lib/server/matcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Human 发提问 */
export async function POST(req: Request) {
  const { connId, text } = (await req.json().catch(() => ({}))) as {
    connId?: string;
    text?: string;
  };
  if (!connId || typeof text !== "string" || !text.trim()) {
    return Response.json({ ok: false, error: "missing connId/text" }, { status: 400 });
  }
  const result = matcher.enqueueHumanPrompt(connId, text.trim().slice(0, 2000));
  if (!result.ok) {
    return Response.json(result, { status: 409 });
  }
  return Response.json(result);
}
