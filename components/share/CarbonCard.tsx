"use client";

import type { ChatMessage } from "@/components/terminal/MessageBubble";
import { SITE_DOMAIN, SITE_USER, SITE_WATERMARK } from "@/lib/site";

/**
 * Carbon 风格导出专用渲染节点（不参与正常 UI，仅供 html-to-image 截图）
 *
 * 设计：
 *   - 黑底绿字 + JetBrains Mono 等宽
 *   - 顶部 macOS 三色点 + 域名/角色标题栏
 *   - 中间纯净消息流（过滤掉 thinking/typing 进行中的）
 *   - 底部命令行 watermark + 域名引流
 */
const ROLE_STYLE = {
  human: { prefix: "guest", color: "#00ff41" },
  copilot: { prefix: "copilot", color: "#00ccff" },
  system: { prefix: "system", color: "#008f00" },
} as const;

export function CarbonCard({
  messages,
  role,
}: {
  messages: ChatMessage[];
  role: "human" | "copilot";
}) {
  // 过滤 thinking 占位 + 还在打字中且没文本的
  const clean = messages.filter(
    (m) => !m.thinking && !(m.typing && !m.text)
  );

  return (
    <div
      style={{
        background: "#000000",
        color: "#00ff41",
        padding: "32px",
        fontFamily:
          "var(--font-jetbrains-mono), ui-monospace, 'Cascadia Code', monospace",
        width: 720,
        boxSizing: "border-box",
        border: "1px solid #008f00",
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingBottom: 16,
          marginBottom: 16,
          borderBottom: "1px solid #008f00",
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ff5f56",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ffbd2e",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#27c93f",
            display: "inline-block",
          }}
        />
        <span
          style={{
            marginLeft: 12,
            fontSize: 12,
            color: "#008f00",
          }}
        >
          {SITE_USER} — bash · role: {role.toUpperCase()}
        </span>
      </div>

      {/* 消息流 */}
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
        {clean.length === 0 && (
          <div style={{ color: "#008f00", fontSize: 13 }}>
            {"// conversation too short. go troll a bit first."}
          </div>
        )}
        {clean.map((m) => {
          const style = ROLE_STYLE[m.role];
          return (
            <div
              key={m.id}
              style={{
                marginBottom: 6,
                display: "flex",
                gap: 4,
              }}
            >
              <span
                style={{
                  color: "#008f00",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: style.color, fontWeight: "bold" }}>
                  {style.prefix}@local
                </span>
                {":~$ "}
              </span>
              <div
                style={{
                  color: style.color,
                  whiteSpace: "pre-wrap",
                  flex: 1,
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* watermark */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #008f00",
          fontSize: 12,
          color: "#008f00",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{SITE_WATERMARK}</span>
        <span style={{ opacity: 0.7 }}>{SITE_DOMAIN}</span>
      </div>
    </div>
  );
}
