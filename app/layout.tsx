import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import AIFab from "@/components/AIFab";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DrawerProvider } from "@/contexts/DrawerContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { CareModeProvider } from "@/contexts/CareModeContext";
import { FluxImmersiveProvider } from "@/contexts/FluxImmersiveContext";
import "./globals.css";

/* ────────────────────────────────────────────
 * 动态导入 framer-motion 组件（ssr: false）
 * framer-motion 的模块初始化会访问 window/document，
 * 即使在 "use client" 组件中也可能在 SSR 阶段报错。
 * 通过 dynamic import + ssr: false 彻底禁止服务端执行。
 * ──────────────────────────────────────────── */

const Sidebar = dynamic(() => import("@/components/Sidebar"), {
  ssr: false,
  loading: () => <div className="w-56 lg:w-60 h-full bg-rose-50/80" />,
});

const PageTransition = dynamic(() => import("@/components/PageTransition"), {
  ssr: false,
  loading: ({ children }: { children?: React.ReactNode }) => <div className="h-full">{children}</div>,
});

const InspirationDrawer = dynamic(() => import("@/components/InspirationDrawer"), {
  ssr: false,
});

const AIChatDrawer = dynamic(() => import("@/components/AIChatDrawer"), {
  ssr: false,
});

const MidnightToast = dynamic(() => import("@/components/MidnightToast"), {
  ssr: false,
});

const ExamChecklist = dynamic(() => import("@/components/ExamChecklist"), {
  ssr: false,
});

const NavTriggerLine = dynamic(() => import("@/components/NavTriggerLine"), {
  ssr: false,
});

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
 * Metadata
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
 * 根布局
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
        <ThemeProvider>
          <CareModeProvider>
            <FluxImmersiveProvider>
              <DrawerProvider>
                <ChatProvider>
                  <div className="flex h-full">
                    <div className="shrink-0 h-full">
                      <Sidebar />
                    </div>
                    <main className="flex-1 h-full overflow-y-auto bg-white">
                      <ErrorBoundary>
                        <PageTransition>{children}</PageTransition>
                      </ErrorBoundary>
                    </main>
                  </div>

                  {/* 心流模式导航线 — 纯客户端组件 */}
                  <NavTriggerLine />

                  {/* 功能抽屉 & 浮层 — 全部仅在客户端渲染 */}
                  <InspirationDrawer />
                  <AIFab />
                  <AIChatDrawer />
                  <MidnightToast />
                  <ExamChecklist />
                </ChatProvider>
              </DrawerProvider>
            </FluxImmersiveProvider>
          </CareModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
