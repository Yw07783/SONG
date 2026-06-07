"use client";

import { useEffect, useState, useCallback } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  city: string;
  district: string;
}

type ModalPhase = "confirm" | "generating" | "done";

export default function AIPredictModal({ open, onClose, city, district }: Props) {
  const [phase, setPhase] = useState<ModalPhase>("confirm");
  const [progress, setProgress] = useState(0);

  /* ESC 关闭 */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "generating") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, phase]);

  /* 打开时重置 */
  useEffect(() => {
    if (open) {
      setPhase("confirm");
      setProgress(0);
    }
  }, [open]);

  /* 生成动画 */
  const handleGenerate = useCallback(() => {
    setPhase("generating");
    setProgress(0);

    // 模拟进度
    const steps = [
      { at: 600, to: 15 },
      { at: 1400, to: 35 },
      { at: 2200, to: 55 },
      { at: 3000, to: 75 },
      { at: 3800, to: 92 },
      { at: 4500, to: 100 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach(({ at, to }) => {
      timers.push(setTimeout(() => setProgress(to), at));
    });
    timers.push(setTimeout(() => setPhase("done"), 4800));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (!open) return null;

  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={phase === "generating" ? undefined : onClose}
        className="fixed inset-0 z-50 bg-stone-900/12 backdrop-blur-[1px] transition-opacity duration-300"
      />

      {/* 弹窗 */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
      >
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(140,100,100,0.2)] border border-stone-100 overflow-hidden"
          style={{ animation: "taskSlideIn 0.35s ease-out both" }}
        >
          {/* 顶部渐变条 */}
          <div
            className="h-1.5 w-full"
            style={{
              background: "linear-gradient(90deg, #e8b8b8, #d49a9a, #c88080)",
            }}
          />

          <div className="px-7 pt-7 pb-7">
            {phase === "confirm" && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <span className="text-3xl">✨</span>
                  <h3 className="text-[17px] font-medium text-stone-700 tracking-wide">
                    AI 预测模拟卷生成
                  </h3>
                </div>

                <div className="bg-rose-50/60 rounded-2xl px-5 py-4 text-center space-y-2">
                  <p className="text-[13px] text-stone-500 leading-relaxed tracking-wide">
                    系统将结合
                    <span className="text-rose-500 font-medium"> {city}·{district} </span>
                    的历年出题规律
                    <br />
                    与你的<span className="text-rose-500 font-medium"> 个人错题薄弱点</span>
                    <br />
                    为你实时生成专属模拟卷。
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-2xl text-[14px] tracking-wide text-stone-400 bg-stone-50 border border-stone-200 transition-all duration-200 hover:bg-stone-100 active:scale-[0.985] touch-target"
                  >
                    暂不需要
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium tracking-wide text-white transition-all duration-300 active:scale-[0.985] touch-target"
                    style={{
                      background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
                      boxShadow: "0 4px 20px -6px rgba(180,120,120,0.4)",
                    }}
                  >
                    立即生成
                  </button>
                </div>
              </div>
            )}

            {phase === "generating" && (
              <div className="space-y-6 text-center">
                <span className="text-3xl animate-pulse">🪄</span>
                <div>
                  <h3 className="text-[17px] font-medium text-stone-700 tracking-wide mb-1.5">
                    正在生成专属模拟卷…
                  </h3>
                  <p className="text-[13px] text-stone-400 tracking-wide">
                    正在结合该区历年出题规律与您的错题薄弱点
                  </p>
                </div>

                {/* 进度条 */}
                <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #e0b0b0, #d49090, #c87878)",
                    }}
                  />
                </div>

                <p className="text-[12px] text-stone-300 tracking-wide">
                  {progress < 30 && "正在解析考情数据…"}
                  {progress >= 30 && progress < 55 && "正在匹配错题薄弱点…"}
                  {progress >= 55 && progress < 80 && "正在组卷与难度校准…"}
                  {progress >= 80 && progress < 100 && "最终质量审核中…"}
                  {progress >= 100 && "生成完毕！"}
                </p>
              </div>
            )}

            {phase === "done" && (
              <div className="space-y-5 text-center">
                <span className="text-4xl">✅</span>
                <div>
                  <h3 className="text-[17px] font-medium text-stone-700 tracking-wide mb-1.5">
                    专属模拟卷已生成
                  </h3>
                  <p className="text-[13px] text-stone-400 tracking-wide leading-relaxed">
                    已结合 {city}·{district} 出题规律
                    <br />
                    与你的薄弱项精准组卷
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl text-[14px] font-medium tracking-wide text-white transition-all duration-300 active:scale-[0.985] touch-target"
                    style={{
                      background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
                      boxShadow: "0 4px 20px -6px rgba(180,120,120,0.4)",
                    }}
                  >
                    开始刷题 →
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl text-[14px] tracking-wide text-stone-400 transition-colors duration-200 hover:text-stone-500 touch-target"
                  >
                    稍后再说
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
