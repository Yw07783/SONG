"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function RewardGift() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  return (
    <>
      {/* 礼物盒按钮 */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/60 transition-colors duration-200 touch-target"
        aria-label="查看本周奖励"
      >
        <motion.span
          className="text-base"
          whileHover={{ rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 0.5 }}
        >
          🎁
        </motion.span>
      </button>

      {/* 奖励弹窗 */}
      <AnimatePresence>
        {open && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-stone-900/12 backdrop-blur-[1px]"
            />

            {/* 弹窗 */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 400, damping: 28 },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: 10,
                  transition: { duration: 0.2 },
                }}
                className="pointer-events-auto relative w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(140,100,100,0.25)] border border-stone-100 overflow-hidden"
              >
                {/* 顶部渐变条 */}
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: "linear-gradient(90deg, #e8b8b8, #d49a9a, #c88080)",
                  }}
                />

                <div className="px-7 pt-8 pb-7 text-center space-y-5">
                  {/* 大图标 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: 0.15,
                    }}
                    className="text-5xl"
                  >
                    🎉
                  </motion.div>

                  {/* 标题 */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-medium text-stone-700 tracking-wide">
                      恭喜完成本周目标！
                    </h3>
                    <div className="bg-rose-50/60 rounded-2xl px-5 py-4">
                      <p className="text-[14px] text-stone-600 leading-relaxed tracking-wide">
                        凭此券可兑换
                        <br />
                        <span className="text-rose-500 font-medium">
                          朋友准备的水果拼盘一份
                        </span>
                        <span className="text-xl ml-1">🍉</span>
                      </p>
                    </div>
                    <p className="text-[11px] text-stone-300 tracking-wide">
                      本周打卡 5 天 · 做题 120 道 · 正确率 83%
                    </p>
                  </div>

                  {/* 按钮 */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-2xl text-[14px] tracking-wide text-stone-400 bg-stone-50 border border-stone-200 transition-all duration-200 hover:bg-stone-100 active:scale-[0.985] touch-target"
                    >
                      先存着
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-2xl text-[14px] font-medium tracking-wide text-white transition-all duration-200 active:scale-[0.985] touch-target"
                      style={{
                        background: "linear-gradient(135deg, #e8b8b8, #d49a9a, #c88080)",
                        boxShadow: "0 4px 16px -6px rgba(180,120,120,0.4)",
                      }}
                    >
                      立即兑换 ✨
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
