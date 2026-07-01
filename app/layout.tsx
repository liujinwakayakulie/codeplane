import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_TITLE, SITE_URL } from "@/lib/site";
import { TopNav } from "@/components/layout/TopNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: "Real humans trolling each other like AIs. Every answer burns 10% battery.",
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
