"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCareMode } from "@/contexts/CareModeContext";
import { useTheme, THEMES, type ThemeId } from "@/contexts/ThemeContext";

export default function SettingsPopover() {
  const { careMode, toggleCare } = useCareMode();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  /* 外部点击关闭 */
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, close]);

  return (
    <div ref={ref} className="relative shrink-0">
      {/* 齿轮按钮 */}
      <button
        type="button"
        onClick={toggle}
        className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/60 transition-colors duration-200 touch-target"
        aria-label="打开设置"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          className="text-stone-400"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* 弹出面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-stone-100 shadow-[0_12px_40px_-12px_rgba(140,100,100,0.18)] p-5 z-20"
          >
            {/* 头像区域 */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-100/80 flex items-center justify-center text-lg">👩‍🏫</div>
              <div>
                <p className="text-[14px] font-medium text-stone-600 tracking-wide">老宋</p>
                <p className="text-[11px] text-stone-300 tracking-wide">实习初中语文教师</p>
              </div>
            </div>

            <div className="border-t border-stone-50 pt-4">
              {/* 主题选择 */}
              <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase mb-3">主题选择</p>
              <div className="flex gap-2.5 mb-5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`
                      flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl
                      transition-all duration-300 touch-target
                      ${theme === t.id
                        ? "bg-stone-50 ring-2 ring-offset-1 ring-[var(--a300)]"
                        : "hover:bg-stone-50/60"
                      }
                    `}
                    title={t.label}
                  >
                    <div className="flex gap-0.5">
                      {t.colors.map((c) => (
                        <span key={c} className="w-3 h-5 rounded-sm" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400 tracking-wide">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* 分隔 */}
              <div className="border-t border-stone-50 pt-4">
              {/* 呵护模式开关 */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-stone-600 tracking-wide">
                    低电量 / 特别呵护模式
                  </p>
                  <p className="text-[11px] text-stone-300 tracking-wide mt-0.5">
                    身体第一，轻量备考
                  </p>
                </div>

                {/* Switch */}
                <button
                  type="button"
                  onClick={toggleCare}
                  role="switch"
                  aria-checked={careMode}
                  className={`
                    relative shrink-0 w-11 h-6 rounded-full
                    transition-colors duration-300
                    ${careMode ? "bg-rose-400/70" : "bg-stone-200"}
                  `}
                >
                  <motion.span
                    animate={{ x: careMode ? 21 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {careMode && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 text-[12px] text-rose-400/80 tracking-wide leading-relaxed"
                >
                  🫶 已开启呵护模式。老袁特批：今天躺着听听播客就算满分！
                </motion.p>
              )}
              </div>{/* /呵护模式 section */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
