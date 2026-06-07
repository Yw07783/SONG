"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── 考点速记与提醒 ────────────────────────── */

const REMINDERS = [
  {
    id: "r1",
    text: "新课标简答题高频模板：定义+四维度分述+教学实例。考前必须默写一遍。",
    emoji: "📝",
  },
  {
    id: "r2",
    text: "文言文 120 实词中，之/其/而/以/于 五词考频最高，优先掌握。",
    emoji: "📖",
  },
  {
    id: "r3",
    text: "教学设计评分权重：目标明确 20% + 过程完整 40% + 评价嵌入 20% + 板书设计 20%。",
    emoji: "🎯",
  },
  {
    id: "r4",
    text: "考前压力管理：每天保证 6 小时睡眠，刷题间歇做 5 分钟深呼吸，效率比时长更重要。",
    emoji: "🌿",
  },
];

/* ── 组件 ─────────────────────────────────── */

export default function NotesSticky() {
  const [note, setNote] = useState<typeof REMINDERS[number] | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setNote(REMINDERS[Math.floor(Math.random() * REMINDERS.length)]);
  }, [key]);

  const handleRefresh = () => setKey((k) => k + 1);

  if (!note) return null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] tracking-[0.2em] text-stone-300 uppercase">
        考点速记与提醒
      </span>
      <AnimatePresence mode="wait">
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="relative max-w-xs w-full bg-rose-50/60 rounded-2xl px-5 py-4 border border-rose-100/40 shadow-[0_2px_12px_-4px_rgba(140,100,100,0.08)]"
        >
          {/* 内容 */}
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">{note.emoji}</span>
            <p className="text-[13px] text-stone-600 leading-relaxed tracking-wide">
              {note.text}
            </p>
          </div>

          {/* 底部刷新 */}
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-3 w-full text-center text-[11px] text-stone-300 hover:text-rose-400 tracking-wide transition-colors duration-200 touch-target"
          >
            🔄 换一条
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
