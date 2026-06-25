import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_TITLE } from "@/lib/site";
import { TopNav } from "@/components/layout/TopNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: "真人实时对线，看谁的反串更像 AI。每次回答消耗 10% 电量。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden flex flex-col bg-black text-[#00ff41]">
        <TopNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
