"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/ErrorBoundary";
import AIFab from "@/components/AIFab";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DrawerProvider } from "@/contexts/DrawerContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { CareModeProvider } from "@/contexts/CareModeContext";
import { FluxImmersiveProvider } from "@/contexts/FluxImmersiveContext";

/* ────────────────────────────────────────────
 * framer-motion 组件全部动态导入（ssr: false），
 * 仅在客户端渲染，防止 SSR 阶段崩溃。
 * 此文件必须是 "use client" 组件。
 * ──────────────────────────────────────────── */

const Sidebar = dynamic(() => import("@/components/Sidebar"), {
  ssr: false,
  loading: () => <div className="w-56 lg:w-60 h-full bg-rose-50/80" />,
});

const PageTransition = dynamic(() => import("@/components/PageTransition"), {
  ssr: false,
  loading: () => <div className="h-full" />,
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

export default function ClientBodyLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
