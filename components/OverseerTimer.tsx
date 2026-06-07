"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function OverseerTimer() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 挂载即计时
  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  const isOver60 = elapsed >= 3600; // 60 minutes

  if (elapsed === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      {/* 计时器主体 */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/60 border border-rose-100/40 text-[12px] tracking-wide text-stone-500 select-none">
        <span>👀</span>
        <span className="hidden sm:inline">老袁 · 专注统计</span>
        <span className="sm:hidden">专注统计</span>
        <span className="font-medium text-stone-600 tabular-nums ml-1">
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* 超过 60 分钟提醒 */}
      <AnimatePresence>
        {isOver60 && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-[11px] text-rose-400/80 tracking-wide"
          >
            💬 专注超过 60 分钟，建议起身活动、补充水分后再继续。
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
