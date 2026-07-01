import Link from "next/link";
import { SITE_DOMAIN, SITE_WATERMARK } from "@/lib/site";

const LINKS = [
  { href: "/history", label: "History" },
  { href: "/code-of-conduct", label: "Conduct" },
  { href: "/terms-of-service", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
] as const;

/**
 * 全局底部
 * 一行三个法律链接 + watermark 命令行
 */
export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-[#008f00]/60 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#008f00]">
      <div className="flex items-center gap-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hover:text-[#00ff41] transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3 opacity-80">
        <span>{SITE_WATERMARK}</span>
        <span className="hidden sm:inline opacity-60">·</span>
        <span className="hidden sm:inline opacity-60">{SITE_DOMAIN}</span>
      </div>
    </footer>
  );
}
