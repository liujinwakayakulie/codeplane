import { matcher, type ServerEvent } from "@/lib/server/matcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * SSE 下行通道
 *
 * 浏览器侧：new EventSource("/api/match/stream?connId=xxx")
 * 服务端：注册 subscriber，把 ServerEvent 编码成 SSE 帧推下去
 *
 * 心跳：每 25s 推一行注释，防止 Nginx/CF 等代理 30s 超时关连接
 * 断开：req.signal abort 时清理 matcher 里的订阅 + 等待中的 prompt/slot
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const connId = url.searchParams.get("connId");
  if (!connId) {
    return new Response("missing connId", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (ev: ServerEvent) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`
            )
          );
        } catch {
          /* controller already closed */
        }
      };

      matcher.enroll(connId, send);
      send({ type: "connected", connId });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          /* closed */
        }
      }, 25000);

      const cleanup = () => {
        clearInterval(heartbeat);
        matcher.withdraw(connId);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // 客户端断开：Request.signal
      req.signal.addEventListener("abort", cleanup, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", // 禁 Nginx 缓冲
      Connection: "keep-alive",
    },
  });
}
