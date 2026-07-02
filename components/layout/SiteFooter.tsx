import Link from "next/link";
import { SITE_DOMAIN, SITE_WATERMARK } from "@/lib/site";
import { ContactInfo } from "./ContactInfo";

const LINKS = [
  { href: "/how-to-play", label: "How to play" },
  { href: "/history", label: "History" },
  { href: "/code-of-conduct", label: "Conduct" },
  { href: "/terms-of-service", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
] as const;

/**
 * 全局底部
 * 法律链接 + watermark 命令行 + contact（邮箱 + 复制按钮）
 */
export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[#008f00]/60 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#008f00]">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hover:text-[#00ff41] transition-colors"
          >
            {l.label}
          </Link>
        ))}
        <span className="text-[#008f00]/40 hidden sm:inline">·</span>
        <ContactInfo />
      </div>
      <div className="flex items-center gap-3 opacity-80">
        <span>{SITE_WATERMARK}</span>
        <span className="hidden sm:inline opacity-60">·</span>
        <span className="hidden sm:inline opacity-60">{SITE_DOMAIN}</span>
      </div>
    </footer>
  );
}
