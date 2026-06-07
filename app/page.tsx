"use client";

import dynamic from "next/dynamic";
import { useCareMode } from "@/contexts/CareModeContext";

/* ────────────────────────────────────────────
 * framer-motion 组件使用 dynamic import + ssr: false，
 * 防止 SSR 阶段模块初始化时访问 window/document 导致崩溃。
 * ──────────────────────────────────────────── */

const LiteraryQuote = dynamic(() => import("@/components/LiteraryQuote"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-4">
      <p className="text-[16px] sm:text-[18px] text-stone-400 tracking-wide animate-pulse">
        老袁正在准备今日金句...
      </p>
    </div>
  ),
});

const StudyTimeSlider = dynamic(() => import("@/components/StudyTimeSlider"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-200 animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0.1s" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  ),
});

const NotesSticky = dynamic(() => import("@/components/NotesSticky"), { ssr: false });
const WeeklyReport = dynamic(() => import("@/components/WeeklyReport"), { ssr: false });
const CheckInStamp = dynamic(() => import("@/components/CheckInStamp"), { ssr: false });

export default function Home() {
  const { careMode } = useCareMode();

  return (
    <div className="flex flex-col h-full">
      {/* 顶部：问候 + 文学盲盒 + 打卡印章 */}
      <div className="shrink-0 px-8 pt-10 pb-2">
        <div className="flex items-start justify-between gap-6">
          {/* 左侧：欢迎语 / 文学盲盒 */}
          <div className="flex-1 min-w-0">
            {careMode ? (
              <div className="text-center space-y-2">
                <p className="text-[16px] sm:text-[18px] leading-relaxed text-stone-600 tracking-wide">
                  今天身体第一 ✨
                </p>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-rose-400/80 tracking-wide">
                  老袁特批：躺着听听播客就算满分！
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-[11px] text-stone-300 tracking-wide bg-rose-50/60 px-3 py-1 rounded-full">
                    🫶 特别呵护模式已开启
                  </span>
                </div>
              </div>
            ) : (
              <LiteraryQuote />
            )}
          </div>

          {/* 右侧：打卡印章 */}
          <div className="shrink-0">
            <CheckInStamp />
          </div>
        </div>
      </div>

      {/* 核心交互区：时间滑块 + 任务清单 */}
      <div className="flex-1 overflow-y-auto">
        <StudyTimeSlider careMode={careMode} />
      </div>

      {/* 底栏：考点速记 + 周报入口 */}
      <div className="shrink-0 px-6 sm:px-8 pb-6 flex items-center justify-between gap-3">
        <NotesSticky />
        <div className="shrink-0">
          <WeeklyReport />
        </div>
      </div>
    </div>
  );
}
