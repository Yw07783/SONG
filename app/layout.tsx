import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientBodyLayout from "./ClientBodyLayout";
import "./globals.css";

/* ────────────────────────────────────────────
 * 字体
 * ──────────────────────────────────────────── */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ────────────────────────────────────────────
 * Metadata（必须在 Server Component 中导出）
 * ──────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "老宋 · 教招备考伴侣",
  description: "专为初中语文教师招聘考试打造的专业备考工具",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    title: "老宋",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

/* ────────────────────────────────────────────
 * 根布局（Server Component）
 * 所有浏览器端逻辑委托给 ClientBodyLayout。
 * ──────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-theme="pink"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ── PWA: 老宋 原生化全配置 ──────── */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="老宋" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="老宋" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <meta name="theme-color" content="#fef2f2" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
      </head>
      <body className="h-full overflow-hidden">
        <ClientBodyLayout>{children}</ClientBodyLayout>
      </body>
    </html>
  );
}
