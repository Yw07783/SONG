"use client";

import { useEffect } from "react";

/**
 * 应用级错误边界 —— 捕获页面级渲染错误。
 * Next.js App Router 自动包裹 layout 的 {children}。
 * reset() 会尝试重新渲染出错的路由段。
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError] 页面错误:", error.message);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] bg-white">
      <div className="text-center space-y-4 px-8 max-w-sm">
        {/* 装饰 */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-rose-50" />
          <span className="absolute inset-0 flex items-center justify-center text-3xl">
            🌸
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-[16px] font-medium text-stone-600 tracking-wide">
            页面加载异常
          </h2>
          <p className="text-[13px] text-stone-400 tracking-wide leading-relaxed">
            可能是网络波动或临时故障，请尝试重试。
          </p>
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-50 text-rose-500 text-[14px] font-medium tracking-wide transition-all duration-200 hover:bg-rose-100 active:scale-95 touch-target"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          重新加载
        </button>
      </div>
    </div>
  );
}
