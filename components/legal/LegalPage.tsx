import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_DOMAIN } from "@/lib/site";

/**
 * 法律/规则页通用骨架
 * 终端风：顶部 path 提示 + 标题 + // 风格的分节 +
 * 一行返回首页的命令行 link。
 *
 * 复用：把内容段落作为 children 传入，外层包装一致。
 */
export function LegalPage({
  path,
  title,
  blurb,
  updated = "2026-06-22",
  children,
}: {
  path: string;
  title: string;
  blurb?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 overflow-y-auto px-6 py-10 max-w-2xl mx-auto w-full">
      <div className="text-[10px] text-[#008f00] mb-4 select-none">
        <span className="text-[#00ff41]">cat</span> {path}
      </div>

      <h1 className="text-xl sm:text-2xl text-[#00ff41] font-bold tracking-wide mb-2">
        # {title}
      </h1>
      {blurb && (
        <p className="text-xs text-[#008f00] mb-6">
          {"// "}
          {blurb}
        </p>
      )}

      <div className="text-sm leading-relaxed text-[#00ff41]/90 space-y-4">
        {children}
      </div>

      <div className="mt-10 pt-4 border-t border-[#008f00]/60 text-[10px] text-[#008f00] flex items-center justify-between">
        <span>
          {"// last updated: "}
          {updated}
        </span>
        <span>{SITE_DOMAIN}</span>
      </div>

      <div className="mt-4">
        <Link
          href="/"
          className="text-xs text-[#00ccff] hover:text-[#00ff41] transition-colors"
        >
          $ cd ~/  ← back home
        </Link>
      </div>
    </main>
  );
}

/**
 * 一节：## 小标题 + 段落
 */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="text-[#00ccff] text-sm font-bold mb-2">## {title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/**
 * 一条规则/条款：- 开头的终端列表项
 */
export function LegalItem({ children }: { children: ReactNode }) {
  return (
    <p className="pl-3 text-[#00ff41]/80">
      <span className="text-[#008f00]">- </span>
      {children}
    </p>
  );
}

/**
 * 段落正文
 */
export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-[#00ff41]/80">{children}</p>;
}
