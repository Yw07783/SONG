"use client";

import { useState, useMemo, useCallback } from "react";
import { classifyError, CATEGORY_META, type ErrorCategory } from "@/lib/errorClassifier";

/* ── Mock 错题归档 ────────────────────────── */

interface ArchivedError {
  id: string;
  question: string;
  answer: string;
  category: ErrorCategory;
  date: string;
}

const MOCK_ERRORS: ArchivedError[] = [
  { id: "e1", question: '《爱莲说》“出淤泥而不染”象征什么品质？', answer: '君子身处污浊环境而不与世俗同流合污。', category: "wenyan", date: "2026-06-05" },
  { id: "e2", question: "简述教育心理学中学习迁移的含义。", answer: "一种学习对另一种学习的影响，包括正迁移和负迁移。", category: "xinlixue", date: "2026-06-04" },
  { id: "e3", question: "2022 版课标四大核心素养是什么？", answer: "文化自信、语言运用、思维能力、审美创造。", category: "kebiao", date: "2026-06-03" },
  { id: "e4", question: "教学设计中板书设计的三个原则。", answer: "清晰性、逻辑性、启发性。", category: "jiaoxue", date: "2026-06-02" },
  { id: "e5", question: "李白诗歌的主要艺术特色。", answer: "浪漫主义、丰富想象、夸张手法、清新自然的语言风格。", category: "gushi", date: "2026-06-01" },
  { id: "e6", question: "班主任如何处理课堂突发事件？", answer: "冷静处理、课后沟通、引导反思、班会强化。", category: "banzhuren", date: "2026-05-30" },
];

/* ── 组件 ─────────────────────────────────── */

export default function ErrorArchivePanel() {
  const [filter, setFilter] = useState<ErrorCategory | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? MOCK_ERRORS : MOCK_ERRORS.filter((e) => e.category === filter)),
    [filter],
  );

  const counts = useMemo(() => {
    const map = new Map<ErrorCategory, number>();
    MOCK_ERRORS.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + 1));
    return map;
  }, []);

  const handleClassify = useCallback((q: string) => classifyError(q), []);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] space-y-5">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
            错题自动分类归档
          </p>
          <p className="text-[12px] text-stone-400 mt-1 tracking-wide">
            共 {MOCK_ERRORS.length} 道错题 · 按模块归类
          </p>
        </div>
        <span className="text-[11px] text-stone-300 bg-stone-50 px-3 py-1.5 rounded-xl tracking-wide">
          🏷️ 自动归类
        </span>
      </div>

      {/* 分类标签筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-[12px] tracking-wide transition-all duration-200 touch-target ${
            filter === "all" ? "bg-rose-100/60 text-rose-600" : "bg-stone-50 text-stone-400 hover:bg-stone-100"
          }`}
        >
          全部 ({MOCK_ERRORS.length})
        </button>
        {Object.values(CATEGORY_META).map((cat) => {
          const count = counts.get(cat.key) ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setFilter(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-[12px] tracking-wide transition-all duration-200 touch-target ${
                filter === cat.key ? "bg-rose-100/60 text-rose-600" : "bg-stone-50 text-stone-400 hover:bg-stone-100"
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 错题列表 */}
      <div className="space-y-3">
        {filtered.map((err) => {
          const cat = CATEGORY_META[err.category];
          return (
            <div
              key={err.id}
              className="px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50/40 space-y-2 transition-all duration-200 hover:bg-stone-50 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] px-2 py-0.5 rounded-lg tracking-wide ${
                  cat.subject === "语文" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                }`}>
                  {cat.subject} · {cat.label}
                </span>
                <span className="text-[11px] text-stone-300">{err.date}</span>
              </div>
              <p className="text-[14px] text-stone-600 tracking-wide leading-relaxed">
                ❓ {err.question}
              </p>
              <p className="text-[12px] text-stone-400 tracking-wide leading-relaxed pl-3 border-l-2 border-rose-200/50">
                ✅ {err.answer}
              </p>
            </div>
          );
        })}
      </div>

      {/* 底部统计 */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-50 text-[11px] text-stone-300 tracking-wide">
        <span>系统自动归类：{new Date().toISOString().slice(0, 10)} 更新</span>
        <span className="px-2 py-0.5 rounded-lg bg-rose-50/50 text-rose-400/80">
          高效提分关键：精准归因，靶向补漏
        </span>
      </div>
    </div>
  );
}
