"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function PDFExport() {
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleClick = useCallback(() => {
    setModalOpen(true);
    setGenerating(true);

    // Mock 2.5s 后完成
    setTimeout(() => {
      setGenerating(false);
    }, 2500);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setGenerating(false);
  }, []);

  return (
    <>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-[13px] text-stone-500 tracking-wide transition-all duration-300 hover:border-rose-200/60 hover:text-rose-500 hover:shadow-[0_4px_16px_-6px_rgba(180,130,130,0.1)] active:scale-[0.985] touch-target"
      >
        <span>🖨️</span>
        <span>导出考前必刷 PDF</span>
      </button>

      {/* 模态框 */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={generating ? undefined : handleClose}
              className="fixed inset-0 z-50 bg-stone-900/12 backdrop-blur-[1px]"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="pointer-events-auto relative w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(140,100,100,0.2)] border border-stone-100 overflow-hidden"
              >
                <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #e8b8b8, #d49a9a, #c88080)" }} />

                <div className="px-7 pt-7 pb-7 text-center space-y-5">
                  <span className="text-4xl block">🖨️</span>

                  <div>
                    <h3 className="text-[17px] font-medium text-stone-700 tracking-wide mb-1.5">
                      导出考前必刷 PDF
                    </h3>

                    {generating ? (
                      <div className="space-y-4">
                        <p className="text-[13px] text-stone-400 tracking-wide leading-relaxed">
                          正在为您排版最高频错题与老袁考前锦囊，即将生成高清晰度 PDF...
                        </p>
                        {/* 进度条 */}
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: "linear-gradient(90deg, #e0b0b0, #d49090)" }}
                          />
                        </div>
                        <p className="text-[12px] text-stone-300 tracking-wide animate-pulse">PDF 生成中…</p>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="bg-emerald-50/60 rounded-2xl px-5 py-4">
                          <p className="text-[14px] text-emerald-700 tracking-wide">
                            ✅ PDF 已生成完毕！
                          </p>
                          <p className="text-[12px] text-stone-400 tracking-wide mt-1.5">
                            含 32 道高频错题 + 老袁考前锦囊 3 条
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-3 rounded-2xl text-[14px] tracking-wide text-stone-400 bg-stone-50 border border-stone-200 transition-all duration-200 hover:bg-stone-100 active:scale-[0.985] touch-target"
                          >
                            稍后再说
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
                            下载 PDF 📥
                          </button>
                        </div>
                      </motion.div>
                    )}
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
