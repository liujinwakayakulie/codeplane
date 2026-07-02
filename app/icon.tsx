import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * 浏览器标签 favicon：黑底 + 单个绿色 "C" 字符（CodingPlane 首字母）
 * 32x32 在 retina 屏会清晰；小尺寸（16x16）也认得出
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          color: "#00ff41",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "monospace",
          border: "2px solid #00ff41",
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
