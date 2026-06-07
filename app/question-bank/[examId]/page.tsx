"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import ReadingPanel from "@/components/ReadingPanel";
import QuestionPanel from "@/components/QuestionPanel";
import { useFluxImmersive } from "@/contexts/FluxImmersiveContext";

/* framer-motion 组件必须禁止 SSR */
const ExamAmbience = dynamic(() => import("@/components/ExamAmbience"), { ssr: false });
const OverseerTimer = dynamic(() => import("@/components/OverseerTimer"), { ssr: false });
const AmbientLight = dynamic(() => import("@/components/AmbientLight"), { ssr: false });

interface Props {
  params: Promise<{ examId: string }>;
}

export default function ExamSplitPage({ params }: Props) {
  const { enable, disable } = useFluxImmersive();

  /* 进入心流模式 → 隐藏侧边栏 / 退出 → 还原 */
  useEffect(() => {
    enable();
    return () => disable();
  }, [enable, disable]);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部面包屑 + 氛围工具 */}
      <div className="shrink-0 px-6 py-3 border-b border-stone-100/80 bg-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <a
            href="/question-bank"
            className="text-[12px] text-stone-300 hover:text-rose-400 tracking-wide transition-colors shrink-0"
          >
            ← 返回考情大盘
          </a>
        </div>

        {/* 右侧工具组：专注统计 + 环境音 + 呼吸灯 */}
        <div className="relative shrink-0 flex items-center gap-3">
          <OverseerTimer />
          <ExamAmbience />
          <AmbientLight scene="quiz" />
        </div>
      </div>

      {/* 分屏刷题区 */}
      <div className="flex flex-1 min-h-0">
        <div className="w-[46%] shrink-0 h-full border-r border-stone-100 shadow-[inset_-1px_0_4px_-2px_rgba(0,0,0,0.03)]">
          <ReadingPanel />
        </div>
        <div className="flex-1 h-full">
          <QuestionPanel />
        </div>
      </div>
    </div>
  );
}
