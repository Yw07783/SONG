"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamAmbience() {
  const [on, setOn] = useState(false);

  const toggle = useCallback(() => setOn((v) => !v), []);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl
          text-[12px] tracking-wide
          transition-all duration-300
          touch-target
          ${
            on
              ? "bg-rose-50/80 text-rose-500 border border-rose-200/60"
              : "text-stone-300 hover:text-stone-500 hover:bg-stone-50 border border-transparent"
          }
        `}
        aria-label={on ? "关闭考场环境音" : "开启考场环境音"}
      >
        <span className="text-base">{on ? "🎧" : "🎧"}</span>
        <span className="hidden sm:inline">
          {on ? "沙沙声播放中" : "考场环境音"}
        </span>
      </button>

      {/* 状态气泡 */}
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-100 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)] text-[12px] text-stone-500 tracking-wide whitespace-nowrap z-10"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              正在播放：沙沙写字声
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
