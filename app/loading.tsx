/**
 * 应用级加载状态 —— 页面路由切换时显示。
 * Next.js App Router 自动包裹在 layout 的 {children} 外层。
 */
export default function AppLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* 呼吸灯 */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full bg-rose-100 animate-ping opacity-75" />
          <div className="relative w-12 h-12 rounded-full bg-rose-200/80 flex items-center justify-center">
            <span className="text-lg">🌸</span>
          </div>
        </div>
        <p className="text-[13px] text-stone-400 tracking-wide animate-pulse">
          老袁正在加载...
        </p>
      </div>
    </div>
  );
}
