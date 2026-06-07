"use client";

import { useState, useCallback } from "react";

/* ── Mock 数据 ────────────────────────────── */

interface ReviewTask {
  id: string;
  title: string;
  desc: string;
  count: number;
}

interface SniperOption {
  value: string;
  label: string;
  description: string;
}

const PASSIVE_TASKS: ReviewTask[] = [
  {
    id: "p1",
    title: "智能错题本",
    desc: "系统温故 · 今日待重做",
    count: 10,
  },
];

const SNIPER_OPTIONS: SniperOption[] = [
  {
    value: "wenyan-shici",
    label: "文言文实词",
    description: "常见 120 个文言实词辨析",
  },
  {
    value: "kebiao-jianda",
    label: "新课标简答题",
    description: "课程标准核心概念简答",
  },
  {
    value: "gushi-jianshan",
    label: "古诗鉴赏",
    description: "意象分析与手法总结",
  },
  {
    value: "zuowen-lizhi",
    label: "作文立意",
    description: "材料作文审题与立意",
  },
  {
    value: "jiaoxue-sheji",
    label: "教学设计",
    description: "教案框架与板块逻辑",
  },
  {
    value: "jiaoyu-jiliang",
    label: "教育测量",
    description: "试题分析与评价术语",
  },
];

/* ── 组件 ─────────────────────────────────── */

export default function ReviewCards() {
  const [sniperValue, setSniperValue] = useState("");
  const [sniperCount, setSniperCount] = useState<number | null>(null);

  const handleSniperChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setSniperValue(val);
      if (val) {
        // Mock：伪随机生成题量
        const seed = val.length * 7 + 3;
        setSniperCount(seed);
      } else {
        setSniperCount(null);
      }
    },
    [],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
      {/* ── 卡片 A：系统温故 ───────────────── */}
      <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 text-rose-400">
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
              系统温故
            </p>
            <p className="text-[12px] text-stone-400 tracking-wide">
              被动触发
            </p>
          </div>
        </div>

        {PASSIVE_TASKS.map((task) => (
          <div key={task.id}>
            <p className="text-[15px] font-medium text-stone-600 tracking-wide mb-1">
              {task.title}
            </p>
            <p className="text-[13px] text-stone-400 tracking-wide mb-4">
              {task.desc}
            </p>

            {/* 进度条 */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-300/70 transition-all duration-700"
                  style={{ width: `${(task.count / 10) * 100}%` }}
                />
              </div>
              <span className="text-[13px] font-medium text-rose-500 tabular-nums tracking-wide">
                {task.count} 题
              </span>
            </div>

            <button
              type="button"
              className="
                mt-5 w-full py-3 rounded-2xl
                text-[14px] font-medium tracking-wide
                bg-rose-50/80 text-rose-500
                border border-rose-100/60
                transition-all duration-300
                hover:bg-rose-100/50 hover:border-rose-200/60
                active:scale-[0.985]
                touch-target
              "
            >
              开始温故
            </button>
          </div>
        ))}
      </div>

      {/* ── 卡片 B：精准狙击 ───────────────── */}
      <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 text-rose-400">
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
              精准狙击
            </p>
            <p className="text-[12px] text-stone-400 tracking-wide">
              主动选择
            </p>
          </div>
        </div>

        {/* 下拉筛选 */}
        <label className="block text-[13px] text-stone-500 tracking-wide mb-2">
          选择薄弱模块
        </label>

        <div className="relative">
          <select
            value={sniperValue}
            onChange={handleSniperChange}
            className="
              w-full appearance-none
              px-4 py-3 pr-10 rounded-2xl
              bg-stone-50 border border-stone-200
              text-[14px] text-stone-600 tracking-wide
              cursor-pointer
              transition-all duration-200
              hover:border-stone-300
              focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100
            "
          >
            <option value="">请选择模块…</option>
            {SNIPER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* 自定义下拉箭头 */}
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* 选中后展示 */}
        {sniperValue && sniperCount !== null && (
          <div
            className="mt-4 px-5 py-4 rounded-2xl bg-rose-50/60 border border-rose-100/50"
            style={{ animation: "taskSlideIn 0.35s ease-out both" }}
          >
            <p className="text-[13px] text-stone-500 tracking-wide">
              {SNIPER_OPTIONS.find((o) => o.value === sniperValue)?.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[13px] text-stone-400 tracking-wide">
                系统为你筛选
              </span>
              <span className="text-[15px] font-medium text-rose-500 tabular-nums tracking-wide">
                {sniperCount} 题
              </span>
            </div>

            <button
              type="button"
              className="
                mt-4 w-full py-3 rounded-2xl
                text-[14px] font-medium tracking-wide
                bg-rose-400/80 text-white
                shadow-[0_4px_16px_-6px_rgba(180,130,130,0.4)]
                transition-all duration-300
                hover:bg-rose-400
                active:scale-[0.985]
                touch-target
              "
            >
              开始狙击
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
