import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${SITE_DOMAIN} — programmer troll arena`;
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

/**
 * Twitter card 用更扁的 1200×600（更接近 summary_large_image 的视觉密度）
 * 内容同 OG 但更紧凑
 */
export default function TwitterImage() {
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
          padding: 50,
          border: "6px solid #008f00",
        }}
      >
        <div
          style={{
            color: "#00ff41",
            fontSize: 140,
            fontWeight: 900,
            letterSpacing: 10,
            textShadow: "0 0 20px rgba(0,255,65,0.6)",
          }}
        >
          CODINGPLANE
        </div>
        <div
          style={{
            color: "#00ccff",
            fontSize: 28,
            marginTop: 30,
            fontStyle: "italic",
          }}
        >
          {"// real-time troll arena. who acts more like an AI?"}
        </div>
        <div style={{ color: "#008f00", fontSize: 22, marginTop: 16 }}>
          {SITE_DOMAIN}
        </div>
      </div>
    ),
    { ...size }
  );
}
