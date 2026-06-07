"use client";

import { useMemo } from "react";

/* ── 类型 ─────────────────────────────────── */

interface DayCell {
  date: string;
  count: number; // 0-5
}

/* ── Mock 数据生成器 ──────────────────────── */

/** 生成最近 ~20 周（140 天）的伪随机刷题数据 */
function generateMockData(): DayCell[] {
  const cells: DayCell[] = [];
  const now = new Date();

  for (let d = 139; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);

    // 用日期哈希制造伪随机，保证 SSR/CSR 一致
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const hash = (seed * 2654435761) >>> 0;

    // 40% 概率当天无记录，其余映射到 1-5
    const r = hash % 100;
    let count = 0;
    if (r >= 40) count = Math.ceil(((r - 40) / 60) * 5);

    cells.push({
      date: date.toISOString().slice(0, 10),
      count,
    });
  }
  return cells;
}

/* ── 等级 → 颜色 ──────────────────────────── */

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-rose-50/60",
  1: "bg-rose-100",
  2: "bg-rose-200/70",
  3: "bg-rose-300/70",
  4: "bg-rose-400/60",
  5: "bg-rose-500/50",
};

const LEVEL_LABELS = ["无记录", "1-5题", "6-10题", "11-15题", "16-20题", "20+题"];

/* ── 组件 ─────────────────────────────────── */

export default function ReviewHeatmap() {
  const data = useMemo(() => generateMockData(), []);

  // 将 140 天按列分组：每列 7 行（周日至周六）
  const WEEKS = 20;
  const COLS = 7;

  // 找到第一个周日对齐
  const startIdx = data.findIndex((d) => new Date(d.date).getDay() === 0);
  const aligned = startIdx >= 0 ? data.slice(startIdx, startIdx + WEEKS * COLS) : data.slice(0, WEEKS * COLS);

  // 按列（week）组织
  const grid: DayCell[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    grid.push(aligned.slice(w * COLS, w * COLS + COLS));
  }

  // 列首是周日，列尾是周六
  const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

  // 月份标签
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    grid.forEach((week, wi) => {
      const first = week[0];
      if (!first) return;
      const m = parseInt(first.date.slice(5, 7), 10);
      const prev = wi > 0 ? grid[wi - 1][0] : null;
      const prevM = prev ? parseInt(prev.date.slice(5, 7), 10) : -1;
      if (m !== prevM) {
        const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
        labels.push({ col: wi, label: monthNames[m - 1] });
      }
    });
    return labels;
  }, [grid]);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
            错题消灭热力图
          </p>
          <p className="text-[13px] text-stone-400 mt-1 tracking-wide">
            近 20 周复习连贯性
          </p>
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-1.5">
          {LEVEL_LABELS.map((lab, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-sm ${LEVEL_COLORS[i]}`} />
              <span className="text-[10px] text-stone-300 hidden sm:inline">{lab}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 热力图主体 */}
      <div className="bg-white rounded-2xl border border-stone-100 px-4 pt-4 pb-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
        {/* 月份标注行 */}
        <div className="flex mb-2 ml-7">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="text-[10px] text-stone-300 tracking-wide"
              style={{ marginLeft: i === 0 ? m.col * 13 : (m.col - (monthLabels[i - 1]?.col ?? 0)) * 13 }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* 周标签 */}
          <div className="flex flex-col gap-0.5 mr-1.5 pt-0.5">
            {weekLabels.map((d, i) => (
              <span key={i} className="text-[9px] text-stone-300 leading-[13px] text-right w-5">
                {d}
              </span>
            ))}
          </div>

          {/* 格子矩阵 */}
          <div className="flex gap-0.5 overflow-x-auto hide-scrollbar pb-0.5">
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5 shrink-0">
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`w-[13px] h-[13px] rounded-sm ${LEVEL_COLORS[cell.count]} transition-colors duration-200`}
                    title={`${cell.date}: ${cell.count} 题`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
