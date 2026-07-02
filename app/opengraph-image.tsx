import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${SITE_DOMAIN} — programmer troll arena`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG / Twitter card image（动态生成）
 *
 * 终端风：黑底 + 大字 CODING / PLANE 两行 + 副标题 + URL
 * 风格匹配首页 ASCII banner（绿黑像素风）
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          padding: 60,
          border: "8px solid #008f00",
        }}
      >
        {/* macOS 风格三色点 */}
        <div
          style={{
            display: "flex",
            gap: 12,
            position: "absolute",
            top: 40,
            left: 60,
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#ff5f56" }} />
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#ffbd2e" }} />
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#27c93f" }} />
        </div>

        {/* prompt 行 */}
        <div
          style={{
            color: "#008f00",
            fontSize: 28,
            marginBottom: 30,
            letterSpacing: 2,
          }}
        >
          {`guest@${SITE_DOMAIN}:~$`}
        </div>

        {/* 主标题：CODING / PLANE 两行 */}
        <div
          style={{
            color: "#00ff41",
            fontSize: 160,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 12,
            textShadow: "0 0 20px rgba(0,255,65,0.6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div>CODING</div>
          <div>PLANE</div>
        </div>

        {/* 副标题 */}
        <div
          style={{
            color: "#00ccff",
            fontSize: 30,
            marginTop: 40,
            fontStyle: "italic",
          }}
        >
          {"// programmer troll arena"}
        </div>

        {/* URL */}
        <div
          style={{
            color: "#008f00",
            fontSize: 24,
            marginTop: 20,
            letterSpacing: 1,
          }}
        >
          {SITE_DOMAIN}
        </div>
      </div>
    ),
    { ...size }
  );
}
