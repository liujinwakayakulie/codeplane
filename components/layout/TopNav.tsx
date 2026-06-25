"use client";

import { SITE_DISCORD_URL, SITE_USER } from "@/lib/site";

/**
 * 全局顶部细条
 * 左：站点命令行 prompt；右：Discord 占位按钮（href=#，hover 提示暂未开放）
 *
 * 不影响 /play 现有的"游戏 header"——这条只是品牌条，play 的 role/battery/倒计时
 * 继续在 PlayClient 自己的 header 里渲染。
 */
export function TopNav() {
  return (
    <nav className="shrink-0 border-b border-[#008f00]/60 bg-black px-4 py-1.5 flex items-center justify-between text-[10px] sm:text-xs">
      <span className="text-[#008f00] select-none truncate">
        <span className="text-[#00ff41]">{SITE_USER}</span>
        <span className="text-[#008f00]"> ~ $</span>
      </span>
      <a
        href={SITE_DISCORD_URL}
        title={
          SITE_DISCORD_URL === "#"
            ? "Discord 暂未开放"
            : "加入 Discord"
        }
        aria-disabled={SITE_DISCORD_URL === "#"}
        onClick={(e) => {
          if (SITE_DISCORD_URL === "#") e.preventDefault();
        }}
        className="border border-[#008f00] px-2 py-0.5 text-[#008f00] hover:bg-[#00ff41]/10 hover:text-[#00ff41] transition-colors"
      >
        ⌁ Discord
      </a>
    </nav>
  );
}
