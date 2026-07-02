"use client";

import { useState } from "react";

const CONTACT_EMAIL = "yanfanqijs@163.com";

/**
 * 底部 footer 的 contact 区：邮箱 + 一键复制按钮
 *
 * 点击复制用 navigator.clipboard.writeText
 * 复制成功后按钮文字短暂切换为 "copied!" 1.2s 再恢复
 */
export function ContactInfo() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 老浏览器 / iframe 无 clipboard 权限，回退到 mailto
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  return (
    <span className="flex items-center gap-1.5">
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="hover:text-[#00ff41] transition-colors"
        title="email me"
      >
        {CONTACT_EMAIL}
      </a>
      <button
        type="button"
        onClick={copy}
        className="text-[9px] border border-[#008f00] px-1 py-0.5 text-[#008f00] hover:text-[#00ff41] hover:border-[#00ff41] transition-colors"
        title="copy email to clipboard"
      >
        {copied ? "✓ copied" : "⧉ copy"}
      </button>
    </span>
  );
}
