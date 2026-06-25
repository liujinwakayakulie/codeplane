import { matcher } from "@/lib/server/matcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Copilot 主动取消等待 */
export async function POST(req: Request) {
  const { connId } = (await req.json().catch(() => ({}))) as { connId?: string };
  if (!connId) {
    return Response.json({ ok: false, error: "missing connId" }, { status: 400 });
  }
  matcher.cancelWaiting(connId);
  return Response.json({ ok: true });
}
