"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadLogEntry {
  id: string;
  fileName: string;
  type: string;
  parsedType: string;
  questionCount: number;
  date: string;
  reviewed: boolean;
  filePath: string;
}

interface MemoryData {
  preferences: {
    weakModules: string[];
    strongModules: string[];
    preferredStyle: string;
    totalFilesUploaded: number;
    totalQuestionsParsed: number;
    lastActiveDate: string;
  };
  uploadLogs: UploadLogEntry[];
  unreviewed: number;
}

export default function AdminReviewView() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/memory");
      if (res.ok) setData(await res.json());
    } catch { /* 忽略 */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  const handleReview = useCallback(async (id: string) => {
    await fetch("/api/memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review", id }),
    });
    fetchData();
  }, [fetchData]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] tracking-wide text-stone-300 hover:text-stone-500 hover:bg-stone-50 transition-all duration-200 touch-target"
      >
        <span>🛠️</span>
        <span>审核</span>
        {data && data.unreviewed > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-500 text-[10px] font-medium">
            {data.unreviewed}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-stone-900/12 backdrop-blur-[1px]"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="pointer-events-auto relative w-full max-w-lg max-h-[80vh] bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(140,100,100,0.2)] border border-stone-100 overflow-hidden flex flex-col"
              >
                <div className="h-1.5 w-full shrink-0" style={{ background: "linear-gradient(90deg, #e8b8b8, #d49a9a, #c88080)" }} />

                <div className="shrink-0 px-6 pt-5 pb-4 border-b border-stone-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-medium text-stone-700 tracking-wide">资料审核管理</h3>
                    <p className="text-[11px] text-stone-300 tracking-wide mt-0.5">
                      {data ? `共 ${data.uploadLogs.length} 条记录 · ${data.unreviewed} 条待审核` : "加载中…"}
                    </p>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} className="text-stone-300 hover:text-stone-400 text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4 space-y-3">
                  {loading && !data && (
                    <div className="text-center py-8 text-[13px] text-stone-300">加载中…</div>
                  )}

                  {data?.uploadLogs.length === 0 && (
                    <div className="text-center py-8 text-[13px] text-stone-300">暂无上传记录</div>
                  )}

                  {data?.uploadLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`px-4 py-3.5 rounded-2xl border text-[13px] tracking-wide transition-all ${
                        log.reviewed ? "bg-stone-50/60 border-stone-100" : "bg-rose-50/40 border-rose-100/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-stone-600 truncate">{log.fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[11px] px-2 py-0.5 rounded-lg ${
                              log.parsedType === "真题试卷" ? "bg-rose-100/50 text-rose-500" :
                              log.parsedType === "考纲文件" ? "bg-blue-50 text-blue-500" :
                              "bg-stone-100 text-stone-400"
                            }`}>
                              {log.parsedType || "未识别"}
                            </span>
                            <span className="text-[11px] text-stone-300">{log.date}</span>
                            <span className="text-[11px] text-stone-300">{log.questionCount} 题</span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {log.reviewed ? (
                            <span className="text-[11px] text-emerald-500 tracking-wide">✓ 已确认</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReview(log.id)}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-medium tracking-wide bg-rose-400/80 text-white transition-all active:scale-95 touch-target"
                            >
                              确认无误
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
