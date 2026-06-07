"use client";

import { useState, useCallback, useRef, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── 组件 ─────────────────────────────────── */

export default function DataUploadZone() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── 提交 ────────────────────────── */
  const handleSubmit = useCallback(async (file?: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      else if (text.trim()) formData.append("text", text.trim());
      else { setError("请上传文件或粘贴内容"); setLoading(false); return; }

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setResult(data.message ?? "资料已成功吸收！");
        setText("");
        if (fileRef.current) fileRef.current.value = "";
        // 刷新页面记忆状态
        setTimeout(() => setResult(null), 5000);
      } else {
        setError(data.error ?? "上传失败");
      }
    } catch {
      setError("网络异常，请稍后重试。");
    }
    setLoading(false);
  }, [text]);

  /* ── 拖拽 ────────────────────────── */
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleSubmit(file);
  }, [handleSubmit]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  return (
    <>
      {/* 入口按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-[13px] text-stone-500 tracking-wide transition-all duration-300 hover:border-rose-200/60 hover:text-rose-500 hover:shadow-[0_4px_16px_-6px_rgba(180,130,130,0.1)] active:scale-[0.985] touch-target"
      >
        <span>📤</span>
        <span>上传备考资料</span>
      </button>

      {/* 弹出面板 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="w-full mt-3"
          >
            <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_8px_32px_-12px_rgba(140,100,100,0.12)] px-6 py-6 space-y-4">
              {/* 拖拽区 */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                className={`
                  flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed
                  transition-all duration-300 cursor-pointer select-none
                  ${dragOver
                    ? "border-rose-300 bg-rose-50/40"
                    : "border-stone-200 bg-stone-50/30 hover:border-rose-200/50 hover:bg-rose-50/20"
                  }
                `}
                onClick={() => fileRef.current?.click()}
              >
                <span className="text-3xl">📂</span>
                <p className="text-[13px] text-stone-400 tracking-wide text-center">
                  拖拽 PDF / Word / TXT 文件到此处
                  <br />
                  <span className="text-[11px] text-stone-300">或在下方粘贴纯文本内容</span>
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSubmit(f);
                  }}
                />
              </div>

              {/* 文本粘贴区 */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="或直接粘贴题目/考纲/笔记内容…（AI 将自动识别并入库）"
                className="w-full px-4 py-3.5 rounded-2xl resize-none bg-stone-50 border border-stone-200 text-[14px] text-stone-600 placeholder-stone-300 tracking-wide leading-relaxed transition-all duration-200 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />

              {/* 按钮区 */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setText(""); setError(null); setResult(null); }}
                  className="px-5 py-2.5 rounded-2xl text-[13px] tracking-wide text-stone-400 bg-stone-50 border border-stone-200 transition-all duration-200 hover:bg-stone-100 active:scale-[0.985] touch-target"
                >
                  清空
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl text-[14px] font-medium tracking-wide text-white transition-all duration-300 active:scale-[0.985] touch-target disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #e8b8b8, #d49a9a, #c88080)",
                    boxShadow: "0 4px 16px -6px rgba(180,120,120,0.4)",
                  }}
                >
                  {loading ? "AI 正在解析中…" : "上传并智能解析"}
                </button>
              </div>

              {/* 加载动画 */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3 py-3"
                  >
                    <div className="flex items-center gap-1">
                      {[0, 0.15, 0.3].map((d) => (
                        <motion.span
                          key={d}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 1, delay: d }}
                          className="w-2 h-2 rounded-full bg-rose-300"
                        />
                      ))}
                    </div>
                    <span className="text-[12px] text-stone-400 tracking-wide">
                      AI 正在为您解析知识中...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 结果反馈 */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/50 text-center"
                  >
                    <p className="text-[13px] text-emerald-700 tracking-wide">✅ {result}</p>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-3.5 rounded-2xl bg-rose-50/60 border border-rose-100/50 text-center"
                  >
                    <p className="text-[13px] text-rose-500 tracking-wide">❌ {error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
