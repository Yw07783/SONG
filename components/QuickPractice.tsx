"use client";

import { useState, useCallback } from "react";

/* ── Mock 题干 ────────────────────────────── */

const SUBJECTIVE_MOCK = {
  id: "sub-001",
  stem: "请结合《义务教育语文课程标准（2022年版）》，简述语文核心素养的四个方面及其在教学中的落实路径。",
  hint: "提示：从文化自信、语言运用、思维能力、审美创造四个维度展开。",
};

/* ── 组件 ─────────────────────────────────── */

export default function QuickPractice() {
  const [keywords, setKeywords] = useState("");
  const [argument, setArgument] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const canSubmit = keywords.trim().length > 0 && argument.trim().length > 0;

  const handleSubmit = useCallback(() => {
    if (!canSubmit || submitted) return;
    setSubmitted(true);

    // Mock 延迟模拟 AI 评分
    setTimeout(() => {
      // 伪随机分数
      const seed =
        (keywords.length * 3 + argument.length * 7) % 100;
      const mockScore = Math.min(98, Math.max(45, seed));
      setScore(mockScore);
    }, 1200);
  }, [canSubmit, submitted, keywords, argument]);

  const handleReset = useCallback(() => {
    setKeywords("");
    setArgument("");
    setSubmitted(false);
    setScore(null);
  }, []);

  return (
    <div className="w-full">
      {/* 标题 */}
      <div className="mb-4">
        <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
          主观题极简速练
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* 题干区 */}
        <div className="px-6 pt-6 pb-5 border-b border-stone-50">
          <h3 className="text-[15px] font-medium text-stone-700 leading-relaxed tracking-wide mb-3">
            {SUBJECTIVE_MOCK.stem}
          </h3>
          <p className="text-[12px] text-rose-400/70 tracking-wide bg-rose-50/50 inline-block px-3 py-1.5 rounded-xl">
            💡 {SUBJECTIVE_MOCK.hint}
          </p>
        </div>

        {/* 输入区 */}
        <div className="px-6 py-5 space-y-4">
          {/* 破题思路关键词 */}
          <div>
            <label className="block text-[12px] text-stone-400 tracking-wide mb-1.5">
              破题思路关键词
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => {
                if (submitted) return;
                setKeywords(e.target.value);
              }}
              disabled={submitted}
              placeholder="例：核心素养 四维度 语言运用 文化自信…"
              className="
                w-full px-4 py-3 rounded-2xl
                bg-stone-50 border border-stone-200
                text-[14px] text-stone-600 placeholder-stone-300
                tracking-wide
                transition-all duration-200
                focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            />
          </div>

          {/* 核心论点 */}
          <div>
            <label className="block text-[12px] text-stone-400 tracking-wide mb-1.5">
              核心论点
            </label>
            <textarea
              value={argument}
              onChange={(e) => {
                if (submitted) return;
                setArgument(e.target.value);
              }}
              disabled={submitted}
              rows={3}
              placeholder="简要陈述你的核心论点与教学落实路径…"
              className="
                w-full px-4 py-3 rounded-2xl resize-none
                bg-stone-50 border border-stone-200
                text-[14px] text-stone-600 placeholder-stone-300
                tracking-wide leading-relaxed
                transition-all duration-200
                focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            />
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 pb-6">
          {/* 评分结果 */}
          {submitted && score === null && (
            <div className="flex items-center justify-center gap-2 py-4 text-stone-400 text-[13px] tracking-wide">
              <svg
                className="animate-spin"
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              正在 AI 评分中…
            </div>
          )}

          {score !== null && (
            <div
              className="mb-4 px-5 py-4 rounded-2xl border text-center"
              style={{
                backgroundColor:
                  score >= 70
                    ? "rgba(236,253,245,0.8)"
                    : "rgba(255,241,242,0.8)",
                borderColor:
                  score >= 70
                    ? "rgba(167,243,208,0.8)"
                    : "rgba(254,205,211,0.8)",
                animation: "taskSlideIn 0.4s ease-out both",
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <span
                  className="text-[28px] font-medium tabular-nums tracking-wide"
                  style={{ color: score >= 70 ? "#059669" : "#e11d48" }}
                >
                  {score}
                </span>
                <span className="text-[12px] text-stone-400 tracking-wide">
                  / 100 分
                </span>
              </div>
              <p
                className="text-[13px] mt-1.5 tracking-wide"
                style={{ color: score >= 70 ? "#059669" : "#e11d48" }}
              >
                {score >= 85
                  ? "优秀！论点清晰，关键词覆盖全面。"
                  : score >= 70
                    ? "良好！框架正确，可进一步丰富例证。"
                    : "需加强。建议回顾课程标准核心概念，补充具体教学案例。"}
              </p>
            </div>
          )}

          {/* 按钮 */}
          {submitted && score !== null ? (
            <button
              type="button"
              onClick={handleReset}
              className="
                w-full py-3.5 rounded-2xl
                text-[14px] font-medium tracking-wide
                bg-white border border-stone-200
                text-stone-500
                transition-all duration-300
                hover:bg-stone-50 hover:border-stone-300
                active:scale-[0.985]
                touch-target
              "
            >
              再来一题
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit || submitted}
              onClick={handleSubmit}
              className={`
                w-full py-3.5 rounded-2xl
                text-[14px] font-medium tracking-wide
                transition-all duration-300
                touch-target
                ${
                  canSubmit && !submitted
                    ? "bg-rose-400/80 text-white shadow-[0_4px_16px_-6px_rgba(180,130,130,0.4)] hover:bg-rose-400 active:scale-[0.985]"
                    : "bg-stone-200/70 text-stone-400 cursor-not-allowed"
                }
              `}
            >
              提交 AI 评分
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
