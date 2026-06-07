"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

type Tab = "grader" | "tracker";

/* framer-motion 子组件全部禁止 SSR */
const HomeworkGrader = dynamic(() => import("@/components/HomeworkGrader"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full py-20">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-200 animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0.1s" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  ),
});

const GradeTracker = dynamic(() => import("@/components/GradeTracker"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full py-20">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-200 animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0.1s" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  ),
});

/* ── Tab 配置 ──────────────────────────── */

const TABS: { key: Tab; label: string; sub: string; icon: string }[] = [
  { key: "grader", label: "作业批改", sub: "AI 智能阅卷分析", icon: "✏️" },
  { key: "tracker", label: "成绩看板", sub: "多考成绩与成长曲线", icon: "📊" },
];

/* ── 组件 ─────────────────────────────────── */

export default function ClassBeaconPage() {
  const [tab, setTab] = useState<Tab>("grader");

  return (
    <div className="flex h-full">
      {/* ── 左侧：功能切换面板 ────────────── */}
      <div className="shrink-0 w-48 lg:w-52 h-full bg-rose-50/50 border-r border-rose-100/40 flex flex-col py-6 px-4 gap-2 select-none">
        <div className="px-2 mb-5">
          <span className="text-xl block mb-1">🏫</span>
          <h2 className="text-[15px] font-medium text-stone-700 tracking-wide">班级航标</h2>
          <p className="text-[11px] text-stone-300 tracking-wide mt-0.5 leading-relaxed">
            实习助教系统
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <motion.button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                whileTap={{ scale: 0.97 }}
                className={`
                  flex items-start gap-3 px-3 py-3.5 rounded-xl
                  text-left transition-all duration-200 touch-target
                  ${
                    active
                      ? "bg-white text-rose-700 shadow-sm border border-rose-100/60"
                      : "text-stone-500 hover:text-rose-600 hover:bg-white/50"
                  }
                `}
              >
                <span className="text-base shrink-0 mt-0.5">{t.icon}</span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium tracking-wide leading-none">{t.label}</p>
                  <p className="text-[10px] text-stone-300 tracking-wide mt-1 leading-tight">{t.sub}</p>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* 底部留白 / 装饰 */}
        <div className="mt-auto px-2">
          <p className="text-[10px] text-stone-200 tracking-wide leading-relaxed">
            让数据为教育减负
            <br />
            AI 教研助手 · 老袁
          </p>
        </div>
      </div>

      {/* ── 右侧：核心内容区 ────────────── */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto hide-scrollbar">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 h-full">
          <AnimatePresence mode="wait">
            {tab === "grader" ? (
              <motion.div
                key="grader"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="h-full"
              >
                <HomeworkGrader />
              </motion.div>
            ) : (
              <motion.div
                key="tracker"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="h-full"
              >
                <GradeTracker />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
