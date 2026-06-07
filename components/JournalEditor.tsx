"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── 流式 API ──────────────────────────── */

async function* streamReflection(diaries: string): AsyncGenerator<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: `请将以下实习日记串联为一篇专业面试反思文稿（150字内，结构完整，适合在教师招聘面试中使用）：\n\n${diaries}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("生成失败");
  const reader = res.body?.getReader();
  if (!reader) throw new Error("无响应流");
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

/* ── 组件 ─────────────────────────────────── */

export default function JournalEditor() {
  const [text, setText] = useState("");
  const [reflection, setReflection] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    if (!text.trim()) return;
    // Mock 保存到 localStorage
    const entries = JSON.parse(localStorage.getItem("jiaozhao_diaries") ?? "[]") as string[];
    entries.push(`${new Date().toISOString().slice(0, 10)}: ${text.trim()}`);
    localStorage.setItem("jiaozhao_diaries", JSON.stringify(entries));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [text]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim() || generating) return;
    setGenerating(true);
    setReflection("");
    try {
      for await (const chunk of streamReflection(text)) {
        setReflection((prev) => prev + chunk);
      }
    } catch {
      setReflection("老袁正在维护中，请稍候再试。");
    }
    setGenerating(false);
  }, [text, generating]);

  return (
    <div className="max-w-2xl mx-auto px-6 sm:px-8 pt-8 pb-12 space-y-8">
      {/* 标题 */}
      <div>
        <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">沉淀感 · 实习日记</p>
        <h2 className="text-xl font-medium text-stone-700 tracking-wide mt-1">记录今天的一线心得</h2>
        <p className="text-[13px] text-stone-400 mt-1.5 leading-relaxed">
          每天几句话，面试时这些真实的课堂经历就是你最强的武器。
        </p>
      </div>

      {/* 日记输入 */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="今天课上发生了什么？哪个环节最满意？哪个学生让你印象深刻？..."
          className="w-full px-6 pt-5 pb-4 resize-none text-[15px] text-stone-600 placeholder-stone-300 tracking-wide leading-relaxed focus:outline-none"
        />
        <div className="flex items-center justify-between px-6 pb-5">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[12px] text-emerald-500 tracking-wide"
              >
                ✅ 已保存
              </motion.span>
            )}
          </AnimatePresence>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={!text.trim()}
              className="px-5 py-2.5 rounded-2xl text-[13px] tracking-wide text-stone-400 bg-stone-50 border border-stone-200 transition-all duration-200 hover:bg-stone-100 active:scale-[0.985] touch-target disabled:opacity-40"
            >
              保存日记
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!text.trim() || generating}
              className="px-5 py-2.5 rounded-2xl text-[13px] font-medium tracking-wide text-white transition-all duration-200 active:scale-[0.985] touch-target disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
                boxShadow: "0 4px 16px -6px rgba(180,120,120,0.4)",
              }}
            >
              {generating ? "生成中…" : "✨ 生成面试反思集"}
            </button>
          </div>
        </div>
      </div>

      {/* AI 反思输出 */}
      <AnimatePresence>
        {(reflection || generating) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] px-6 py-6"
          >
            <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase mb-4">
              AI 面试反思文稿
            </p>
            <div className="text-[14px] text-stone-600 leading-relaxed tracking-wide whitespace-pre-wrap">
              {reflection || (
                <div className="flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: d }}
                      className="w-2 h-2 rounded-full bg-rose-300"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
