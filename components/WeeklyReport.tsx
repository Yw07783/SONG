"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Mock 周报数据 ──────────────────────────── */

interface WeeklyStats {
  totalQuestions: number;
  accuracy: number;
  focusHours: number;
  streak: number;
  weakModules: string[];
  suggestion: string;
}

const MOCK_STATS: WeeklyStats = {
  totalQuestions: 248,
  accuracy: 76,
  focusHours: 14.5,
  streak: 5,
  weakModules: ["文言文实词辨析", "教学设计·板书设计", "教育心理学·学习迁移"],
  suggestion:
    "本周文言文实词正确率偏低（62%），建议每天早晨花 15 分钟专攻「之乎者也」高频 30 词。板书设计模块需重点练习「逻辑可视化」——用思维导图代替线性提纲。",
};

/* ── 组件 ─────────────────────────────────── */

export default function WeeklyReport() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleGenerate = useCallback(() => {
    setOpen(true);
    setLoading(true);
    setReport(null);
    // Mock 加载
    setTimeout(() => {
      setReport(MOCK_STATS.suggestion);
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      {/* 入口按钮 */}
      <button
        type="button"
        onClick={handleGenerate}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-[13px] text-stone-500 tracking-wide transition-all duration-300 hover:border-rose-200/60 hover:text-rose-500 hover:shadow-[0_4px_16px_-6px_rgba(180,130,130,0.1)] active:scale-[0.985] touch-target"
      >
        <span>📊</span>
        <span>本周提分报告</span>
      </button>

      {/* 弹窗 */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-stone-900/12 backdrop-blur-[1px]"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="pointer-events-auto relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(140,100,100,0.2)] border border-stone-100 overflow-hidden"
              >
                <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #e8b8b8, #d49a9a, #c88080)" }} />
                <div className="px-7 pt-6 pb-6 space-y-4">
                  <div className="text-center">
                    <span className="text-3xl">📊</span>
                    <h3 className="text-[17px] font-medium text-stone-700 tracking-wide mt-1">本周提分建议报告</h3>
                  </div>

                  {/* 数据卡片 */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "总刷题数", val: `${MOCK_STATS.totalQuestions} 道` },
                      { label: "正确率", val: `${MOCK_STATS.accuracy}%` },
                      { label: "专注时长", val: `${MOCK_STATS.focusHours}h` },
                      { label: "连续打卡", val: `${MOCK_STATS.streak} 天` },
                    ].map((d) => (
                      <div key={d.label} className="bg-rose-50/40 rounded-2xl px-4 py-3 text-center">
                        <p className="text-[11px] text-stone-300 tracking-wide">{d.label}</p>
                        <p className="text-[15px] font-medium text-stone-600 mt-0.5">{d.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* 薄弱模块 */}
                  <div>
                    <p className="text-[11px] text-stone-300 uppercase tracking-wide mb-2">薄弱模块</p>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_STATS.weakModules.map((m) => (
                        <span key={m} className="px-3 py-1.5 rounded-xl bg-rose-50/60 text-[12px] text-rose-500 tracking-wide">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* AI 建议 */}
                  <div className="bg-stone-50 rounded-2xl px-5 py-4">
                    {loading ? (
                      <div className="flex items-center gap-1.5 justify-center py-2">
                        {[0, 0.15, 0.3].map((d) => (
                          <motion.span key={d} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1, delay: d }} className="w-2 h-2 rounded-full bg-rose-300" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-stone-600 leading-relaxed tracking-wide">{report}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full py-3.5 rounded-2xl text-[14px] font-medium tracking-wide text-white transition-all duration-200 active:scale-[0.985] touch-target"
                    style={{ background: "linear-gradient(135deg, #e8b8b8, #d49a9a, #c88080)", boxShadow: "0 4px 16px -6px rgba(180,120,120,0.4)" }}
                  >
                    知道了，继续刷题
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
