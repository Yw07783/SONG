"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 根级异常边界 —— 捕获渲染树中未处理的错误，
 * 防止白屏，显示优雅降级界面并支持重试。
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] 捕获到渲染错误:", error.message);
    console.error("[ErrorBoundary] 组件栈:", info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-full min-h-[60vh] bg-white">
          <div className="text-center space-y-4 px-8 max-w-sm">
            {/* 装饰 */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-rose-50 animate-pulse" />
              <span className="absolute inset-0 flex items-center justify-center text-3xl">
                🌸
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-[16px] font-medium text-stone-600 tracking-wide">
                页面暂时遇到了问题
              </h2>
              <p className="text-[13px] text-stone-400 tracking-wide leading-relaxed">
                可能是网络波动或组件加载失败，请尝试刷新页面。
              </p>
            </div>

            <button
              type="button"
              onClick={this.handleReset}
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
    return this.props.children;
  }
}
