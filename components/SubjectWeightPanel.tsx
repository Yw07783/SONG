"use client";

import { useMemo } from "react";
import { CATEGORY_META, computeAccuracy, type ErrorCategory } from "@/lib/errorClassifier";

/** Mock 错题归档（局部演示） */
const MOCK_ARCHIVE: { question: string; category: ErrorCategory }[] = [
  { question: '《爱莲说》中"出淤泥而不染"的象征意义', category: "wenyan" },
  { question: "教学设计中板书设计的原则", category: "jiaoxue" },
  { question: "2022版课标四大核心素养", category: "kebiao" },
  { question: "教育心理学中学习迁移的分类", category: "xinlixue" },
];

/* ── 组件 ─────────────────────────────────── */

export default function SubjectWeightPanel() {
  const accuracies = useMemo(() => {
    const entries = MOCK_ARCHIVE.map((m) => ({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      question: m.question,
      category: m.category,
      difficulty: "medium" as const,
      date: new Date().toISOString().slice(0, 10),
    }));
    return computeAccuracy(entries);
  }, []);

  const categories = Object.values(CATEGORY_META);
  const yuWenCats = categories.filter((c) => c.subject === "语文");
  const jiaoZongCats = categories.filter((c) => c.subject === "教综");

  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] space-y-5">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
          双科权重与薄弱分析
        </p>
        <p className="text-[12px] text-stone-400 mt-1 tracking-wide">
          基于江苏教招考纲的智能权重分配
        </p>
      </div>

      {/* 双列：语文 / 教综 */}
      <div className="grid grid-cols-2 gap-4">
        <SubjectColumn label="语文学科" cats={yuWenCats} accuracies={accuracies} />
        <SubjectColumn label="教综" cats={jiaoZongCats} accuracies={accuracies} />
      </div>

      {/* 总权重提示 */}
      <div className="text-center pt-2 border-t border-stone-50">
        <span className="text-[11px] text-stone-300 tracking-wide">
          建议投入比：教综 : 学科 ≈ 50 : 50（江苏教招标准配置）
        </span>
      </div>
    </div>
  );
}

/* ── 单科列 ──────────────────────────────── */

function SubjectColumn({
  label,
  cats,
  accuracies,
}: {
  label: string;
  cats: typeof CATEGORY_META[keyof typeof CATEGORY_META][];
  accuracies: Record<string, number>;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] font-medium text-stone-500 tracking-wide">{label}</p>
      {cats.map((c) => {
        const acc = accuracies[c.key] ?? 100;
        const weak = acc < 60;
        return (
          <div key={c.key} className="space-y-1">
            <div className="flex justify-between text-[12px] tracking-wide">
              <span className={weak ? "text-rose-500" : "text-stone-500"}>{c.label}</span>
              <span className="text-stone-300 tabular-nums">{c.weight}%</span>
            </div>
            {/* 权重进度条 */}
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${weak ? "bg-rose-300/70" : "bg-rose-200/50"}`}
                style={{ width: `${c.weight}%` }}
              />
            </div>
            {/* 薄弱标记 */}
            {weak && (
              <p className="text-[10px] text-rose-400/80 tracking-wide mt-0.5">
                ⚠ 该模块正确率偏低，建议优先攻克
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
