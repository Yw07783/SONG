"use client";

import { useState, useCallback } from "react";

/* ── Mock 选择题数据 ──────────────────────── */

interface Option {
  key: string;
  text: string;
}

const QUESTION_MOCK = {
  stem: "下列对《爱莲说》理解不正确的一项是：",
  options: [
    {
      key: "A",
      text: "作者通过对莲花的描写，表达了自己不慕名利、洁身自好的生活态度。",
    },
    {
      key: "B",
      text: '“出淤泥而不染”象征君子身处污浊环境而不与世俗同流合污的品质。',
    },
    {
      key: "C",
      text: "作者认为世人皆爱牡丹，因此牡丹比莲花更值得推崇。",
    },
    {
      key: "D",
      text: "文章运用了托物言志的手法，借莲花表达作者的高尚情操。",
    },
  ] as const satisfies readonly Option[],
} as const;

/* ── 组件 ─────────────────────────────────── */

export default function QuestionPanel() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = useCallback((key: string) => {
    if (submitted) return;
    setSelected(key);
  }, [submitted]);

  const handleDeselect = useCallback(() => {
    if (submitted) return;
    setSelected(null);
  }, [submitted]);

  const handleConfirm = useCallback(() => {
    if (!selected || submitted) return;
    setSubmitted(true);
  }, [selected, submitted]);

  const handleReset = useCallback(() => {
    setSelected(null);
    setSubmitted(false);
  }, []);

  const isCorrect = selected === "C";

  return (
    <section className="flex flex-col h-full bg-rose-50/30">
      {/* 顶部标题栏 */}
      <div className="shrink-0 px-6 pt-7 pb-5 border-b border-rose-100/50">
        <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase mb-2">
          阅读理解 · 选择题
        </p>
        <span className="inline-block px-3 py-1 rounded-full bg-white/70 text-rose-500/80 text-[12px] font-medium tracking-wide">
          第 1 题 / 共 5 题
        </span>
      </div>

      {/* 题干 + 选项滚动区 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-6">
        {/* 题干 */}
        <div className="bg-white rounded-2xl px-5 py-5 border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] mb-5">
          <p className="text-[15px] leading-relaxed text-stone-700 tracking-wide">
            {QUESTION_MOCK.stem}
          </p>
        </div>

        {/* 选项列表 */}
        <div className="space-y-3">
          {QUESTION_MOCK.options.map((opt) => {
            const isSelected = selected === opt.key;
            let borderClass = "border-stone-100";
            let bgClass = "bg-white";
            let textClass = "text-stone-600";

            if (submitted) {
              if (opt.key === "C") {
                // 正确答案
                borderClass = "border-emerald-200";
                bgClass = "bg-emerald-50/60";
                textClass = "text-emerald-700";
              } else if (isSelected && !isCorrect) {
                // 选错的项
                borderClass = "border-rose-200";
                bgClass = "bg-rose-50/60";
                textClass = "text-rose-600";
              } else {
                borderClass = "border-stone-100";
                bgClass = "bg-white";
                textClass = "text-stone-400";
              }
            } else if (isSelected) {
              borderClass = "border-rose-300";
              bgClass = "bg-rose-50/40";
              textClass = "text-rose-700";
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={submitted}
                onClick={() =>
                  isSelected ? handleDeselect() : handleSelect(opt.key)
                }
                className={`
                  w-full flex items-start gap-4 px-5 py-4
                  rounded-2xl border
                  transition-all duration-300
                  text-left
                  touch-target
                  ${borderClass} ${bgClass}
                  ${
                    submitted
                      ? "cursor-default"
                      : "cursor-pointer hover:shadow-[0_4px_16px_-6px_rgba(180,130,130,0.12)] active:scale-[0.985]"
                  }
                `}
              >
                {/* 选项标识 */}
                <span
                  className={`
                    flex items-center justify-center
                    w-8 h-8 shrink-0 rounded-xl
                    text-[14px] font-semibold tracking-wide
                    transition-colors duration-300
                    ${
                      submitted && opt.key === "C"
                        ? "bg-emerald-100 text-emerald-600"
                        : submitted && isSelected && !isCorrect
                          ? "bg-rose-100 text-rose-500"
                          : isSelected
                            ? "bg-rose-200/70 text-rose-600"
                            : "bg-stone-100 text-stone-400"
                    }
                  `}
                >
                  {opt.key}
                </span>

                {/* 选项文本 */}
                <span
                  className={`flex-1 text-[15px] leading-relaxed tracking-wide pt-0.5 ${textClass}`}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* 提交后的反馈 */}
        {submitted && (
          <div
            className="mt-4 px-5 py-3.5 rounded-2xl border text-center animate-[taskSlideIn_0.4s_ease-out]"
            style={{
              backgroundColor: isCorrect
                ? "rgba(236,253,245,0.8)"
                : "rgba(255,241,242,0.8)",
              borderColor: isCorrect ? "rgba(167,243,208,0.8)" : "rgba(254,205,211,0.8)",
            }}
          >
            <p
              className="text-[14px] font-medium tracking-wide"
              style={{
                color: isCorrect ? "#059669" : "#e11d48",
              }}
            >
              {isCorrect
                ? "✓ 回答正确！作者批判世人追逐富贵的牡丹，推崇莲花的君子品格。"
                : "✗ 回答有误。C 项理解错误——作者恰恰是以牡丹反衬莲花的高洁，批判追名逐利之风。"}
            </p>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="shrink-0 px-6 py-4 border-t border-rose-100/50 bg-white/40">
        {submitted ? (
          <button
            type="button"
            onClick={handleReset}
            className="
              w-full py-3.5 rounded-2xl
              text-[15px] font-medium tracking-wide
              bg-white border border-stone-200
              text-stone-500
              transition-all duration-300
              hover:bg-stone-50 hover:border-stone-300
              active:scale-[0.985]
              touch-target
            "
          >
            重做本题
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="
                shrink-0 px-5 py-3.5 rounded-2xl
                text-[14px] tracking-wide
                text-stone-400
                transition-colors duration-200
                hover:text-stone-500
                touch-target
              "
            >
              清除
            </button>

            <button
              type="button"
              disabled={!selected}
              onClick={handleConfirm}
              className={`
                flex-1 py-3.5 rounded-2xl
                text-[15px] font-medium tracking-wide
                transition-all duration-300
                touch-target
                ${
                  selected
                    ? "bg-rose-400/80 text-white shadow-[0_4px_16px_-6px_rgba(180,130,130,0.4)] hover:bg-rose-400 active:scale-[0.985]"
                    : "bg-stone-200/70 text-stone-400 cursor-not-allowed"
                }
              `}
            >
              确认答案
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
