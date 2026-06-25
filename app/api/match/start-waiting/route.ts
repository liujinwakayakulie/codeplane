import { matcher } from "@/lib/server/matcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Copilot 进队列开始等待 */
export async function POST(req: Request) {
  const { connId } = (await req.json().catch(() => ({}))) as { connId?: string };
  if (!connId) {
    return Response.json({ ok: false, error: "missing connId" }, { status: 400 });
  }
  matcher.enqueueCopilot(connId);
  return Response.json({ ok: true });
}
