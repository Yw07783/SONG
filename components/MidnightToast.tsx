"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "midnight_toast_2026";

/**
 * 判断是否在 23:00 - 23:30 之间
 * @returns true 时触发 30% 概率
 */
function isInMidnightWindow(): boolean {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  return h === 23 && m >= 0 && m < 30;
}

/**
 * 同一天内仅触发一次（利用 localStorage）
 */
function shouldTriggerToday(): boolean {
  if (typeof window === "undefined") return false;

  const today = new Date().toISOString().slice(0, 10); // "2026-06-06"
  const last = localStorage.getItem(STORAGE_KEY);

  if (last === today) return false; // 今天已经触发过了

  if (!isInMidnightWindow()) return false;

  // 30% 概率
  if (Math.random() > 0.3) return false;

  localStorage.setItem(STORAGE_KEY, today);
  return true;
}

export default function MidnightToast() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 初始检查
    if (shouldTriggerToday()) {
      setVisible(true);
      return;
    }

    // 每分钟轮询一次（在 23:00-23:30 窗口内）
    const interval = setInterval(() => {
      if (shouldTriggerToday()) {
        setVisible(true);
        clearInterval(interval);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = useCallback(() => setVisible(false), []);

  // SSR 一致：首次渲染不显示
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-rose-50/98 backdrop-blur-xl border border-rose-100/60 shadow-[0_8px_32px_-10px_rgba(180,130,130,0.25)]"
        >
          <span className="text-[14px] text-stone-600 tracking-wide whitespace-nowrap">
            🌙 叮~ 夜深啦，老宋，该去找老袁了。
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 px-4 py-2 rounded-xl bg-rose-400/80 text-white text-[13px] font-medium tracking-wide shadow-[0_4px_12px_-4px_rgba(180,130,130,0.4)] transition-all duration-200 hover:bg-rose-400 active:scale-95 touch-target"
          >
            收到！下班！
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
