"use client";

import { useState, useMemo, useCallback, useEffect } from "react";

/* ── 类型 ─────────────────────────────────── */

type TaskMode = "micro" | "survival" | "steady" | "sprint" | "immersion";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ModeData {
  tag: string;
  emoji: string;
  tasks: TaskItem[];
}

/* ── Mock 数据 ────────────────────────────── */

const TASK_MAP: Record<TaskMode, ModeData> = {
  micro: {
    tag: "碎片速记模式",
    emoji: "⚡",
    tasks: [
      {
        id: "m1",
        title: "极简错题闪刷",
        description: "刷 5 道错题",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6" />
            <path d="M12 18v-6" /><path d="M9 15h6" />
          </svg>
        ),
      },
    ],
  },
  survival: {
    tag: "极限生存模式",
    emoji: "🕐",
    tasks: [
      {
        id: "s1",
        title: "智能错题本",
        description: "系统温故 10 道题",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6" />
            <path d="M12 18v-6" /><path d="M9 15h6" />
          </svg>
        ),
      },
      {
        id: "s2",
        title: "碎片化知识闪卡",
        description: "基础字音字形",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8" /><path d="M12 17v4" />
          </svg>
        ),
      },
    ],
  },
  steady: {
    tag: "常规稳步模式",
    emoji: "📖",
    tasks: [
      {
        id: "t1",
        title: "靶向题库",
        description: "刷一套客观题",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        ),
      },
      {
        id: "t2",
        title: "古文翻译训练",
        description: "完成一篇古文翻译",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
            <path d="M8 7h6" /><path d="M8 11h8" /><path d="M8 15h5" />
          </svg>
        ),
      },
    ],
  },
  sprint: {
    tag: "周末冲刺模式",
    emoji: "🔥",
    tasks: [
      {
        id: "p1",
        title: "全真模拟",
        description: "历年真题卷一套",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" />
          </svg>
        ),
      },
      {
        id: "p2",
        title: "主观题攻坚",
        description: "完整教学设计（教案）书写",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
          </svg>
        ),
      },
    ],
  },
  immersion: {
    tag: "全职沉浸模式",
    emoji: "🚀",
    tasks: [
      {
        id: "i1",
        title: "两套真题连刷",
        description: "限时模拟两套完整真题卷",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" />
          </svg>
        ),
      },
      {
        id: "i2",
        title: "考情全盘复盘",
        description: "逐题对答案 + 错因归类 + 知识点查漏",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
        ),
      },
      {
        id: "i3",
        title: "教学设计精写",
        description: "两份完整教学设计（教案）精写与打磨",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
          </svg>
        ),
      },
    ],
  },
};

/* ── 辅助函数 ─────────────────────────────── */

function getMode(minutes: number, cap?: boolean): TaskMode {
  const m = cap ? Math.min(minutes, 164) : minutes;
  if (m < 30) return "micro";
  if (m < 75) return "survival";
  if (m < 165) return "steady";
  if (cap) return "steady"; // care mode caps at steady
  if (m < 360) return "sprint";
  return "immersion";
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} 小时`;
  if (h >= 1 && m === 30) return `${h}.5 小时`;
  return `${h} 小时 ${m} 分钟`;
}

/* ── 组件 ─────────────────────────────────── */

interface Props {
  careMode?: boolean;
}

export default function StudyTimeSlider({ careMode = false }: Props) {
  const [minutes, setMinutes] = useState(careMode ? 45 : 105);
  const [transitioning, setTransitioning] = useState(false);

  const maxMin = careMode ? 164 : 480;
  const bands = careMode
    ? [15, 45, 104]  // micro:15, survival:45, steady:104 = total 164
    : [15, 45, 90, 195, 120];
  const tickLabels = careMode
    ? ["15分钟", "30分钟", "1小时", "2小时", "2.5小时"]
    : ["15分钟", "1小时", "2.5小时", "4小时", "6小时", "8小时"];

  const mode = useMemo(() => getMode(minutes, careMode), [minutes, careMode]);
  const modeData = TASK_MAP[mode];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMinutes(Number(e.target.value));
      setTransitioning(true);
      setTimeout(() => setTransitioning(false), 50);
      // 持久化今日学习分钟数（供打卡印章检测）
      if (typeof window !== "undefined") {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`study_minutes_${today}`, String(e.target.value));
      }
    },
    [],
  );

  // care mode 切换时重置
  useEffect(() => {
    setMinutes(careMode ? 45 : 105);
  }, [careMode]);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4 sm:px-6 pt-8 pb-16 gap-9">
      {/* ── 标题区 ─────────────────────── */}
      <div className="text-center space-y-2">
        <p className="text-xs tracking-[0.2em] text-stone-300 uppercase">
          今日复习时间
        </p>
        <h2 className="text-[32px] font-medium tracking-wide text-stone-600 tabular-nums">
          {formatTime(minutes)}
        </h2>
      </div>

      {/* ── 滑块 ───────────────────────── */}
      <div className="w-full space-y-5">
        {/* 区域色带指示器 */}
        <div className="flex w-full h-1.5 rounded-full overflow-hidden">
          {careMode ? (
            <>
              <div className="h-full bg-rose-100/80" style={{ flex: bands[0] }} />
              <div className="h-full bg-rose-200/80" style={{ flex: bands[1] }} />
              <div className="h-full bg-rose-300/80" style={{ flex: bands[2] }} />
            </>
          ) : (
            <>
              <div className="h-full bg-rose-100/80" style={{ flex: bands[0] }} />
              <div className="h-full bg-rose-200/80" style={{ flex: bands[1] }} />
              <div className="h-full bg-rose-300/80" style={{ flex: bands[2] }} />
              <div className="h-full bg-rose-400/70" style={{ flex: bands[3] }} />
              <div className="h-full bg-rose-500/50" style={{ flex: bands[4] }} />
            </>
          )}
        </div>

        {/* range input */}
        <div className="relative">
          <input
            type="range"
            min={15}
            max={maxMin}
            step={5}
            value={minutes}
            onChange={handleChange}
            className="study-slider w-full"
            style={{ "--pct": `${((minutes - 15) / (maxMin - 15)) * 100}%` } as React.CSSProperties}
            aria-label="调整今日复习时间"
          />
        </div>

        {/* 刻度标签 */}
        <div className="flex justify-between text-[11px] text-stone-300 tracking-wide select-none">
          {tickLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── 模式标签 ───────────────────── */}
      <div
        className="flex items-center gap-2 px-5 py-2 rounded-full bg-rose-50/80 text-rose-600/80 text-[13px] font-medium tracking-wide transition-colors duration-500"
        key={mode}
      >
        <span>{modeData.emoji}</span>
        {modeData.tag}
      </div>

      {/* ── 今日专属任务清单 ────────────── */}
      <div className="w-full space-y-3">
        <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase text-center">
          今日专属任务清单
        </p>

        <div
          className="space-y-3 transition-opacity duration-500"
          style={{ opacity: transitioning ? 0.5 : 1 }}
        >
          {modeData.tasks.map((task, i) => (
            <div
              key={task.id}
              className="flex items-start gap-4 px-5 py-5 bg-white border border-stone-100 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.06)]"
              style={{ animation: `taskSlideIn 0.45s ease-out ${i * 80}ms both` }}
            >
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-rose-50 text-rose-400">
                {task.icon}
              </div>
              <div className="flex flex-col gap-0.5 pt-0.5">
                <span className="text-[15px] font-medium text-stone-600 tracking-wide">
                  {task.title}
                </span>
                <span className="text-[13px] text-stone-400 leading-relaxed">
                  {task.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
