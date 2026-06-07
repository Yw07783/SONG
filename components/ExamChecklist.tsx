"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Mock：考试前 1 天检测 ─────────────────── */

/** 仅在挂载时判断，之后不变 */
function isDayBeforeExam(): boolean {
  // Mock: 30% 概率触发（演示用）
  // 生产环境替换为真实的考试日期比较
  if (typeof window !== "undefined") {
    const forced = sessionStorage.getItem("exam_checklist_seen");
    if (forced) return false;
    return Math.random() < 0.3;
  }
  return false;
}

const CHECK_ITEMS = [
  { key: "idcard", label: "身份证", emoji: "🪪" },
  { key: "admission", label: "准考证", emoji: "📄" },
  { key: "pencil", label: "2B 铅笔", emoji: "✏️" },
  { key: "pen", label: "黑色中性笔", emoji: "🖊️" },
] as const;

/* ── 组件 ─────────────────────────────────── */

export default function ExamChecklist() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    if (isDayBeforeExam()) {
      setShow(true);
    }
  }, []);

  const toggleItem = useCallback((key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const allChecked = checked.size === CHECK_ITEMS.length;

  const handleDone = useCallback(() => {
    if (!allChecked) return;
    setShow(false);
    // 标记已看过，刷新前不再弹
    if (typeof window !== "undefined") {
      sessionStorage.setItem("exam_checklist_seen", "1");
    }
  }, [allChecked]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 不可关闭遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[70] bg-stone-900/25 backdrop-blur-[2px]"
          />

          {/* 模态框 */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="pointer-events-auto relative w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(140,100,100,0.3)] border border-stone-100 overflow-hidden"
            >
              {/* 顶部渐变条 */}
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #e8b8b8, #d49a9a, #c88080)" }} />

              <div className="px-7 pt-7 pb-7 space-y-6">
                {/* 标题 */}
                <div className="text-center space-y-1.5">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                    className="text-4xl block"
                  >
                    📋
                  </motion.span>
                  <h3 className="text-[18px] font-medium text-stone-700 tracking-wide">
                    老袁的考前最后通牒
                  </h3>
                  <p className="text-[12px] text-stone-400 tracking-wide">
                    考试倒计时 1 天 · 请逐项核对
                  </p>
                </div>

                {/* Checkbox 列表 */}
                <div className="space-y-3">
                  {CHECK_ITEMS.map((item, i) => {
                    const isChecked = checked.has(item.key);
                    return (
                      <motion.button
                        key={item.key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        type="button"
                        onClick={() => toggleItem(item.key)}
                        className={`
                          w-full flex items-center gap-4 px-5 py-4 rounded-2xl
                          text-left transition-all duration-300 touch-target
                          ${isChecked
                            ? "bg-rose-50/80 border-2 border-rose-200/60 shadow-[0_2px_8px_-2px_rgba(180,130,130,0.12)]"
                            : "bg-stone-50 border-2 border-transparent hover:bg-stone-100/80"
                          }
                        `}
                      >
                        {/* 选框 */}
                        <span
                          className={`
                            shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
                            transition-all duration-300
                            ${isChecked
                              ? "bg-rose-400/80 text-white shadow-[0_2px_8px_-2px_rgba(180,130,130,0.3)]"
                              : "bg-white border-2 border-stone-200 text-transparent"
                            }
                          `}
                        >
                          {isChecked && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>

                        <span className="text-2xl">{item.emoji}</span>
                        <span className={`text-[14px] tracking-wide font-medium ${isChecked ? "text-rose-600" : "text-stone-500"}`}>
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 准备完毕按钮 */}
                <AnimatePresence>
                  {allChecked && (
                    <motion.button
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: 4, height: 0 }}
                      type="button"
                      onClick={handleDone}
                      className="w-full py-4 rounded-2xl text-[15px] font-bold tracking-wider text-white transition-all duration-200 active:scale-[0.98] touch-target"
                      style={{
                        background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
                        boxShadow: "0 6px 24px -6px rgba(180,120,120,0.45)",
                      }}
                    >
                      准备完毕，下发考场！
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
