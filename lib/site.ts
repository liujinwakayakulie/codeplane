/**
 * 站点配置 —— 域名/品牌集中管理
 * 改域名只需要改这一处，所有引用自动跟随
 */

/** 完整域名（含 TLD），用于 header / watermark / metadata */
export const SITE_DOMAIN = "codingplane.me";

/** 站点短名（不含 TLD），用于文件名前缀等 */
export const SITE_NAME = "codingplane";

/** 命令行提示符 user@host，如 "guest@codingplane.me" */
export const SITE_USER = `guest@${SITE_DOMAIN}`;

/** 终端窗口底部水印，如 "$ guest@codingplane.me ~ _" */
export const SITE_WATERMARK = `$ ${SITE_USER} ~ _`;

/** 浏览器标签页标题 */
export const SITE_TITLE = `${SITE_DOMAIN} — programmer troll arena`;

/** 站点完整 URL（含 https://），用于 metadataBase / OpenGraph / 绝对 URL */
export const SITE_URL = `https://${SITE_DOMAIN}`;

/** Discord 邀请链接 */
export const SITE_DISCORD_URL: string = "https://discord.gg/nm3t6a5Zf";
