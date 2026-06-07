"use client";

import dynamic from "next/dynamic";

const EnergyModules = dynamic(() => import("@/components/EnergyModules"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-200 animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0.1s" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  ),
});

const AmbientLight = dynamic(() => import("@/components/AmbientLight"), {
  ssr: false,
});

export default function EnergyPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-8 pb-12 space-y-8">
          {/* 顶部标题 */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
                能量补给站
              </p>
              <h2 className="text-xl font-medium text-stone-700 tracking-wide mt-1">
                放松身心 · 轻量补给
              </h2>
              <p className="text-[13px] text-stone-400 mt-1.5 tracking-wide leading-relaxed">
                备考是一场马拉松，别忘了给自己充充电。
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <AmbientLight scene="calm" />
            </div>
          </div>

          {/* 四模块网格 */}
          <EnergyModules />

          {/* 底部留白 */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
