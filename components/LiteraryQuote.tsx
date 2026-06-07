"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Mock 文学名句 ────────────────────────── */

const QUOTES = [
  {
    text: "世间好物不坚牢，彩云易散琉璃脆。",
    author: "杨绛",
    work: "《我们仨》",
  },
  {
    text: "人生的道路虽然漫长，但紧要处常常只有几步，特别是当人年轻的时候。",
    author: "柳青",
    work: "《创业史》",
  },
  {
    text: "生活不能等待别人来安排，要自己去争取和奋斗；而不论其结果是喜是悲，但可以慰藉的是，你总不枉在这世界上活了一场。",
    author: "路遥",
    work: "《平凡的世界》",
  },
  {
    text: "一个人可以被毁灭，但不能被打败。",
    author: "海明威",
    work: "《老人与海》",
  },
  {
    text: "满地都是六便士，他却抬头看见了月亮。",
    author: "毛姆",
    work: "《月亮与六便士》",
  },
  {
    text: "人是为了活着本身而活着，而不是为了活着之外的任何事物而活着。",
    author: "余华",
    work: "《活着》",
  },
];

export default function LiteraryQuote() {
  const [index, setIndex] = useState(0);
  const current = QUOTES[index];

  const handleRefresh = useCallback(() => {
    setIndex((prev) => (prev + 1) % QUOTES.length);
  }, []);

  return (
    <div className="text-center">
      {/* 动态名句展示 */}
      <div className="relative min-h-[80px] flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-[16px] sm:text-[18px] leading-relaxed text-stone-600 tracking-wide max-w-md">
              「{current.text}」
            </p>
            <p className="text-[12px] text-stone-400 tracking-wide">
              —— {current.author} · {current.work}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ✨ 换一句 */}
      <button
        type="button"
        onClick={handleRefresh}
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-stone-400 hover:text-rose-500 hover:bg-rose-50/60 transition-all duration-200 active:scale-95 touch-target"
        aria-label="换一句名言"
      >
        <span>✨</span>
        <span className="tracking-wide">换一句</span>
      </button>
    </div>
  );
}
