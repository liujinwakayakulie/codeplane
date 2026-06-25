/**
 * ASCII 字符画快捷键库 —— 极客风反串弹药
 * 点击 AsciiMacroMenu 按钮会把对应字符画注入到输入框光标位置
 *
 * 全部单行，避免跨行对齐问题（不同字体 box drawing 字符宽度不一致）
 */

export type AsciiMacro = {
  id: string;
  label: string;
  art: string;
};

export const ASCII_MACROS: AsciiMacro[] = [
  // === classic kaomoji ===
  {
    id: "shrug",
    label: "[shrug]",
    art: "¯\\_(ツ)_/¯",
  },
  {
    id: "lenny",
    label: "[lenny]",
    art: "( ͡° ͜ʖ ͡°)",
  },
  {
    id: "unflip",
    label: "[unflip]",
    art: "┬─┬ ノ( ゜-゜ノ)",
  },
  {
    id: "run",
    label: "[run]",
    art: "ᕕ( ᐛ )ᕗ",
  },
  {
    id: "stare",
    label: "[stare]",
    art: "⚆_⚆",
  },
  {
    id: "dead",
    label: "[dead]",
    art: "(×_×)",
  },
  {
    id: "lgtm",
    label: "[lgtm]",
    art: "(っ˘ω˘ς)  // LGTM, ship it",
  },

  // === coder memes（程序员梗）===
  {
    id: "bug",
    label: "[bug]",
    art: "(╯°□°)╯︵ ┻━┻  // not a bug, it's a feature",
  },
  {
    id: "bomb",
    label: "[bomb]",
    art: "💥 ** segfault (core dumped) **",
  },
  {
    id: "bs",
    label: "[bs]",
    art: "┐('～`;)┌  // works on my machine",
  },
  {
    id: "null",
    label: "[null]",
    art: "return null;  // 🤡",
  },
  {
    id: "404",
    label: "[404]",
    art: "░▒▓ ERROR 404 ▓▒░  answer not found",
  },
  {
    id: "loop",
    label: "[loop]",
    art: "while (true) { /* TODO: fix */ }",
  },
  {
    id: "yolo",
    label: "[yolo]",
    art: "git commit -m 'final final v2 FINAL_final'",
  },
  {
    id: "prod",
    label: "[prod]",
    art: "// I don't always test, but when I do, I do it in production",
  },
  {
    id: "dragons",
    label: "[dragons]",
    art: "// here be dragons, do not touch",
  },
  {
    id: "magic",
    label: "[magic]",
    art: "// black magic, no idea why this works",
  },
  {
    id: "localhost",
    label: "[127.0.0.1]",
    art: "there's no place like 127.0.0.1",
  },
  {
    id: "vim",
    label: "[vim]",
    art: ":wq  // i finally escaped",
  },
  {
    id: "sudo",
    label: "[sudo]",
    art: "sudo make me a sandwich 🥪",
  },
  {
    id: "rmrf",
    label: "[rm-rf]",
    art: "sudo rm -rf /  // goodbye world",
  },
];
