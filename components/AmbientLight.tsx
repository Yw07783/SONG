"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── 场景 → 音效映射 ──────────────────────── */

type Scene = "default" | "reading" | "quiz" | "calm";

const SCENE_LABELS: Record<Scene, string> = {
  default: "环境音效",
  reading: "清晨鸟鸣",
  quiz: "沙沙写字声",
  calm: "舒缓雨声",
};

const SCENE_EMOJI: Record<Scene, string> = {
  default: "🔇",
  reading: "🐦",
  quiz: "✏️",
  calm: "🌧️",
};

/* ── 组件 ─────────────────────────────────── */

interface Props {
  scene?: Scene;
}

export default function AmbientLight({ scene = "default" }: Props) {
  const [on, setOn] = useState(false);
  const currentScene = on ? scene : "default";

  const toggle = useCallback(() => setOn((v) => !v), []);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={`
          relative flex items-center justify-center w-9 h-9 rounded-xl
          transition-all duration-500 touch-target
          ${on ? "bg-rose-50/80 text-rose-500" : "text-stone-300 hover:text-stone-500 hover:bg-stone-50"}
        `}
        aria-label={on ? `关闭${SCENE_LABELS[scene]}` : "开启环境音效"}
        title={SCENE_LABELS[scene]}
      >
        {/* 呼吸灯环 */}
        <span className="absolute inset-0 rounded-xl">
          {on && (
            <motion.span
              animate={{ opacity: [0.15, 0.45, 0.15], scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-xl bg-rose-300"
            />
          )}
        </span>

        <span className="relative z-10 text-sm">{SCENE_EMOJI[currentScene]}</span>
      </button>

      {/* 场景标签气泡 */}
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            className="hidden sm:inline text-[11px] text-stone-400 tracking-wide ml-1"
          >
            {SCENE_LABELS[scene]}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}
