"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { toPng } from "html-to-image";
import type { ChatMessage } from "@/components/terminal/MessageBubble";
import { CarbonCard } from "./CarbonCard";
import { SITE_NAME } from "@/lib/site";

/**
 * Carbon 风格 PNG 导出（ref 化受控版）
 *
 * 父组件持有 ref，调用 `ref.current.exportMessages(filteredMessages)` 时：
 *   1. flushSync 同步把传入的消息塞进隐藏 CarbonCard
 *   2. 调用 html-to-image 的 toPng 把节点转 PNG
 *   3. 触发下载，文件名 `${SITE_NAME}-${timestamp}.png`
 *
 * 隐藏节点必须保留在 DOM 里且 opacity:1（html-to-image 用 DOM clone +
 * foreignObject 渲染，display:none 或 opacity:0 都会导致字体/布局失效），
 * 所以用 fixed + 移出屏外。
 */
export type ScreenshotExportHandle = {
  /** 用传入的消息子集生成 PNG 并下载；busy 时忽略 */
  exportMessages: (messages: ChatMessage[]) => Promise<void>;
  /** 是否正在导出 */
  busy: boolean;
};

export const ScreenshotExport = forwardRef<
  ScreenshotExportHandle,
  { role: "human" | "copilot"; children?: ReactNode }
>(function ScreenshotExport({ role, children }, ref) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  useImperativeHandle(ref, () => ({
    busy,
    async exportMessages(messages: ChatMessage[]) {
      const node = cardRef.current;
      if (!node || busy) return;
      setBusy(true);
      try {
        // flushSync 保证 DOM 在 toPng 之前已经按新 messages 重渲染完
        flushSync(() => setRendered(messages));
        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          backgroundColor: "#000000",
          skipFonts: false,
          cacheBust: true,
        });
        const link = document.createElement("a");
        link.download = `${SITE_NAME}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("[ScreenshotExport] failed:", err);
        alert("截图失败，看控制台");
      } finally {
        setBusy(false);
      }
    },
  }));

  return (
    <>
      {children}

      {/* 隐藏渲染节点 */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          pointerEvents: "none",
        }}
      >
        <div ref={cardRef}>
          <CarbonCard messages={rendered} role={role} />
        </div>
      </div>
    </>
  );
});
