"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StudentGradePoint, ClassAvgPoint, CategoryScores, StudentAnalytics } from "./GradeTracker";

/* ══════════════════════════════════════════════
 * 类型
 * ══════════════════════════════════════════════ */

interface Props {
  open: boolean;
  onClose: () => void;
  studentName: string;
  grades: StudentGradePoint[];
  classAverages: ClassAvgPoint[];
  analytics?: StudentAnalytics;
}

/* 维度中文映射 */
const CAT_CN: Record<string, string> = {
  文言文: "文言文",
  现代文阅读: "现代文阅读",
  作文: "作文",
  古诗鉴赏: "古诗鉴赏",
  基础知识: "基础知识",
  教学设计: "教学设计",
};

const CAT_COLORS: Record<string, string> = {
  文言文: "#c88080",
  现代文阅读: "#d49a9a",
  作文: "#e8b8b8",
  古诗鉴赏: "#c89870",
  基础知识: "#a8b8d8",
  教学设计: "#a8d8c8",
};

const CAT_MAX: Record<string, number> = {
  文言文: 20,
  现代文阅读: 25,
  作文: 25,
  古诗鉴赏: 15,
  基础知识: 10,
  教学设计: 5,
};

/* ══════════════════════════════════════════════
 * AI 诊断（流式）
 * 注入真实学情数据 — 符合 Spec 第三部分
 * ══════════════════════════════════════════════ */

async function* streamDiagnosis(
  studentName: string,
  grades: StudentGradePoint[],
  analytics?: StudentAnalytics,
): AsyncGenerator<string> {
  const sorted = [...grades].sort((a, b) => a.date.localeCompare(b.date));

  /* 派生字段 */
  const delta = analytics
    ? `${analytics.trend}（最近变动 ${analytics.trendDelta > 0 ? "+" : ""}${analytics.trendDelta} 分）`
    : sorted.length >= 2
      ? (() => {
          const d = sorted[sorted.length - 1].score - sorted[sorted.length - 2].score;
          return d > 0 ? `进步 +${d}` : d < 0 ? `退步 ${d}` : "持平";
        })()
      : "数据不足";

  const weakestDim = analytics?.weakestDim
    ? `${CAT_CN[analytics.weakestDim] ?? analytics.weakestDim}（得分率 ${Math.round(analytics.weakestPct * 100)}%）`
    : "暂无维度数据";

  const errorTags = analytics?.topErrors?.length
    ? analytics.topErrors.join("、")
    : "暂无错题标签";

  const avgScore = analytics?.avgScore ?? (sorted.length > 0 ? Math.round(sorted.reduce((s, g) => s + g.score, 0) / sorted.length) : 0);

  /* 精准诊断 Prompt */
  const prompt = `老宋发来了一份学生的学情档案。
该生姓名：${studentName}
历次均分：${avgScore}
近期成绩进退状态：${delta}
最低得分率维度：${weakestDim}
高频错题标签：${errorTags}

请作为教研组长进行毒辣且务实的诊断，用100字内的专业战友语气，指出明天上课或面批时应该针对该生采取的精准行动。
称呼"${studentName}同学"。
回复格式：先一句话切中要害（定性），再给出1-2条精准行动建议（含预估时长）。`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "diagnosis",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error("");
    const reader = res.body?.getReader();
    if (!reader) throw new Error("");
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } catch {
    yield "老袁正在维护中，请稍候再试。";
  }
}

/* ══════════════════════════════════════════════
 * 成绩趋势图 (SVG)
 * ══════════════════════════════════════════════ */

function TrendChart({ grades, classAvgs }: { grades: StudentGradePoint[]; classAvgs: ClassAvgPoint[] }) {
  if (grades.length === 0) return <p className="text-[11px] text-stone-300 text-center py-8">暂无数据</p>;

  const sorted = [...grades].sort((a, b) => a.date.localeCompare(b.date));
  const avgs = [...classAvgs].sort((a, b) => a.date.localeCompare(b.date));

  const allVals = [...sorted.map((g) => g.score), ...avgs.map((a) => a.avg)];
  const maxV = 100;
  const minV = Math.max(0, Math.min(...allVals) - 10);

  const w = 280; const h = 140;
  const pad = { top: 10, right: 12, bottom: 24, left: 28 };
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;

  const toX = (i: number) => pad.left + (i / Math.max(sorted.length - 1, 1)) * pw;
  const toY = (v: number) => pad.top + ph - ((v - minV) / (maxV - minV)) * ph;

  const studentLine = sorted.map((g, i) => `${toX(i)},${toY(g.score)}`).join(" ");
  const avgLine = avgs.map((a, i) => `${toX(i)},${toY(a.avg)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[320px] h-auto mx-auto">
      {[minV, Math.round((minV + maxV) / 2), maxV].map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#f0e8e8" strokeWidth="0.5" strokeDasharray="3,2" />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" className="text-[8px] fill-stone-300">{v}</text>
          </g>
        );
      })}
      <polyline points={avgLine} fill="none" stroke="#d4b8b8" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <polyline points={studentLine} fill="none" stroke="#c88080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {sorted.map((g, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(g.score)} r="3.5" fill="#fff" stroke="#c88080" strokeWidth="1.5" />
          <text x={toX(i)} y={toY(g.score) - 8} textAnchor="middle" className="text-[8px] fill-stone-500 font-medium">{g.score}</text>
          <text x={toX(i)} y={h - 3} textAnchor="middle" className="text-[7px] fill-stone-300">
            {g.examName.length > 4 ? g.examName.slice(0, 4) + "…" : g.examName}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════
 * 维度雷达图 (SVG polar)
 * ══════════════════════════════════════════════ */

function RadarChart({ categories }: { categories: CategoryScores }) {
  const dims = Object.entries(CAT_MAX)
    .filter(([k]) => categories[k as keyof CategoryScores] != null)
    .sort(([a], [b]) => a.localeCompare(b));

  if (dims.length === 0) return <p className="text-[11px] text-stone-300 text-center py-4">未录入维度分数</p>;

  const n = dims.length;
  const R = 72;
  const cx = 90; const cy = 82;

  const toAngle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const levels = [0.25, 0.5, 0.75, 1];

  const values = dims.map(([k]) => {
    const v = (categories[k as keyof CategoryScores] ?? 0) / (CAT_MAX[k] ?? 20);
    return Math.max(0.05, Math.min(1, v));
  });

  const dataPts = values
    .map((v, i) => {
      const a = toAngle(i);
      return `${cx + v * R * Math.cos(a)},${cy + v * R * Math.sin(a)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 180 164" className="w-full max-w-[180px] h-auto mx-auto">
      {levels.map((lv) => {
        const pts = dims.map((_, i) => {
          const a = toAngle(i);
          return `${cx + lv * R * Math.cos(a)},${cy + lv * R * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={lv} points={pts} fill="none" stroke="#f0e0e0" strokeWidth="0.6" />;
      })}
      {dims.map((_, i) => {
        const a = toAngle(i);
        return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="#f0e0e0" strokeWidth="0.5" />;
      })}
      <polygon points={dataPts} fill="#e8b8b8" fillOpacity="0.2" stroke="#c88080" strokeWidth="1.3" strokeLinejoin="round" />
      {values.map((v, i) => {
        const a = toAngle(i);
        return <circle key={i} cx={cx + v * R * Math.cos(a)} cy={cy + v * R * Math.sin(a)} r="3" fill="#fff" stroke="#c88080" strokeWidth="1.5" />;
      })}
      {dims.map(([k], i) => {
        const a = toAngle(i);
        return (
          <text key={k} x={cx + (R + 20) * Math.cos(a)} y={cy + (R + 20) * Math.sin(a)}
            textAnchor="middle" dominantBaseline="middle" className="text-[9px] fill-stone-400">
            {CAT_CN[k] ?? k}
          </text>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════
 * DeltaBar
 * ══════════════════════════════════════════════ */

function DeltaBar({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const absPct = Math.min(Math.abs(diff), 30);
  const barW = (absPct / 30) * 100;

  return (
    <div className="flex items-center gap-2">
      {diff > 0 ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-emerald-500 font-medium tabular-nums">+{diff}</span>
          <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${barW}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full rounded-full bg-emerald-400/60" />
          </div>
        </div>
      ) : diff < 0 ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-rose-400 font-medium tabular-nums">{diff}</span>
          <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${barW}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className="h-full rounded-full bg-rose-300/60" />
          </div>
        </div>
      ) : (
        <span className="text-[11px] text-stone-300 tabular-nums">持平</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
 * 主组件
 * ══════════════════════════════════════════════ */

export default function StudentProfileDrawer({ open, onClose, studentName, grades, classAverages, analytics }: Props) {
  const [diagnosis, setDiagnosis] = useState("");
  const [diagLoading, setDiagLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "errors" | "categories">("overview");

  useEffect(() => { setMounted(true); }, []);

  /* ESC */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ── 派生数据 ────────────── */
  const sorted = useMemo(() => [...grades].sort((a, b) => a.date.localeCompare(b.date)), [grades]);
  const sortedAvgs = useMemo(() => [...classAverages].sort((a, b) => a.date.localeCompare(b.date)), [classAverages]);

  const stats = useMemo(() => {
    if (sorted.length === 0) return { avg: 0, max: 0, min: 0, rank: "-", trend: "—", trendIcon: "→" };
    const scores = sorted.map((g) => g.score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const lastIdx = sorted.length - 1;
    const lastClassAvg = sortedAvgs[lastIdx]?.avg;
    const vsAvg = lastClassAvg != null ? sorted[lastIdx].score - lastClassAvg : 0;
    const rank = vsAvg >= 10 ? "前列" : vsAvg >= 0 ? "中上" : vsAvg >= -10 ? "中下" : "待提升";

    let trend = "—"; let trendIcon = "→";
    if (sorted.length >= 2) {
      const d = sorted[sorted.length - 1].score - sorted[sorted.length - 2].score;
      if (d >= 8) { trend = "显著上升"; trendIcon = "↑↑"; }
      else if (d >= 3) { trend = "稳步上升"; trendIcon = "↑"; }
      else if (d <= -8) { trend = "明显下滑"; trendIcon = "↓↓"; }
      else if (d <= -3) { trend = "小幅下滑"; trendIcon = "↓"; }
      else { trend = "保持稳定"; trendIcon = "→"; }
    }

    return { avg, max, min, rank, trend, trendIcon };
  }, [sorted, sortedAvgs]);

  /* 薄弱项 */
  const weaknesses = useMemo(() => {
    const ws: string[] = [];
    const errFreq: Record<string, number> = {};
    sorted.forEach((g) => {
      g.errors?.forEach((e) => { errFreq[e] = (errFreq[e] ?? 0) + 1; });
    });
    Object.entries(errFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([k]) => ws.push(k));

    const latestCat = sorted[sorted.length - 1]?.categories;
    if (latestCat) {
      const catEntries = Object.entries(latestCat)
        .filter(([k]) => CAT_MAX[k])
        .map(([k, v]) => ({ key: k, val: v as number, pct: (v as number) / (CAT_MAX[k] ?? 20) }))
        .sort((a, b) => a.pct - b.pct);
      catEntries.slice(0, 2).forEach((c) => {
        const label = CAT_CN[c.key] ?? c.key;
        if (!ws.includes(label) && c.pct < 0.65) ws.push(label);
      });
    }

    return ws.slice(0, 4);
  }, [sorted]);

  /* ── AI 诊断（使用 analytics 增补） ─ */
  useEffect(() => {
    if (!open || !studentName) return;
    setDiagnosis("");
    setDiagLoading(true);
    let cancelled = false;
    (async () => {
      try {
        for await (const chunk of streamDiagnosis(studentName, sorted, analytics)) {
          if (cancelled) break;
          setDiagnosis((prev) => prev + chunk);
        }
      } catch { /* ignore */ }
      if (!cancelled) setDiagLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, studentName]); // eslint-disable-line react-hooks/exhaustive-deps

  const latestCategories = sorted[sorted.length - 1]?.categories;

  if (!mounted) return null;

  const TAB_BTNS: { key: typeof activeTab; label: string }[] = [
    { key: "overview", label: "概览" },
    { key: "categories", label: "维度" },
    { key: "errors", label: "错题" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={onClose} aria-hidden="true"
            className="fixed inset-0 z-40 bg-stone-900/12 backdrop-blur-[1px]"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0, transition: { type: "spring", stiffness: 280, damping: 30 } }}
            exit={{ x: "100%", transition: { type: "spring", stiffness: 300, damping: 28 } }}
            className="fixed top-0 right-0 z-50 h-full w-[min(420px,92vw)] bg-white/98 backdrop-blur-xl border-l border-stone-100 shadow-[-8px_0_40px_-16px_rgba(140,100,100,0.1)] flex flex-col"
          >
            {/* ═══ 头部 ═══ */}
            <div className="shrink-0 px-6 pt-7 pb-4 border-b border-stone-100/80 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[18px] font-medium tracking-wide text-stone-700">{studentName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      stats.trend.includes("上升") ? "bg-emerald-50 text-emerald-500" :
                      stats.trend.includes("下滑") ? "bg-rose-50 text-rose-400" :
                      "bg-stone-50 text-stone-400"
                    }`}>
                      {stats.trendIcon} {stats.trend}
                    </span>
                    <span className="text-[11px] text-stone-300 tracking-wide">均分 {stats.avg} · {stats.rank}</span>
                  </div>
                </div>
                <button
                  type="button" onClick={onClose}
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-stone-300 hover:text-stone-500 hover:bg-stone-50 transition-colors touch-target"
                  aria-label="关闭"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "考试次数", value: sorted.length },
                  { label: "最高分", value: stats.max },
                  { label: "最低分", value: stats.min },
                  { label: "平均分", value: stats.avg },
                ].map((item) => (
                  <div key={item.label} className="text-center bg-stone-50 rounded-xl py-2.5">
                    <p className="text-[17px] font-medium text-stone-700 tabular-nums">{item.value}</p>
                    <p className="text-[9px] text-stone-300 tracking-wide mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ Tab 切换 ═══ */}
            <div className="shrink-0 flex gap-1 px-6 pt-3 pb-2 border-b border-stone-50">
              {TAB_BTNS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-2 rounded-lg text-[12px] tracking-wide transition-all duration-200 touch-target ${
                    activeTab === t.key ? "bg-rose-50 text-rose-600 font-medium" : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ═══ 内容区 ═══ */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-5 space-y-5">
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                    <section className="bg-rose-50/30 rounded-2xl border border-rose-100/40 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">📈</span>
                        <h3 className="text-[12px] font-medium text-stone-600 tracking-wide">成绩趋势</h3>
                      </div>
                      <TrendChart grades={sorted} classAvgs={sortedAvgs} />
                      <p className="text-[9px] text-stone-300 text-center mt-2">虚线为班级均分参照</p>
                    </section>

                    {sorted.length >= 2 && (
                      <section>
                        <h3 className="text-[12px] font-medium text-stone-600 tracking-wide mb-3 px-1">历次考试进退分析</h3>
                        <div className="space-y-2">
                          {sorted.map((g, i) => {
                            if (i === 0) return null;
                            const prev = sorted[i - 1];
                            const classAvg = sortedAvgs[i]?.avg;
                            return (
                              <div key={g.examName} className="bg-white rounded-xl border border-stone-100 px-4 py-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[12px] font-medium text-stone-600">{g.examName}</span>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-[13px] font-semibold tabular-nums ${
                                      g.score >= 85 ? "text-emerald-500" : g.score >= 70 ? "text-amber-500" : "text-rose-400"
                                    }`}>{g.score}分</span>
                                    <span className="text-[10px] text-stone-300">班均{classAvg ?? "—"}分</span>
                                  </div>
                                </div>
                                <DeltaBar current={g.score} previous={prev.score} />
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {weaknesses.length > 0 && (
                      <section>
                        <h3 className="text-[12px] font-medium text-stone-600 tracking-wide mb-3 px-1">⚠️ 薄弱项预警</h3>
                        <div className="flex flex-wrap gap-2">
                          {weaknesses.map((w) => (
                            <motion.span key={w} initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-100/60 text-[12px] text-rose-500 tracking-wide">
                              {w}
                            </motion.span>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* 老袁诊断 — 真实 AI 流式输出 */}
                    <section>
                      <h3 className="text-[12px] font-medium text-stone-600 tracking-wide mb-3 px-1">🩺 老袁诊断</h3>
                      <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] px-5 py-4">
                        {diagLoading && !diagnosis ? (
                          <div className="flex items-center gap-1.5 py-1">
                            {[0, 0.15, 0.3].map((d) => (
                              <motion.span
                                key={d}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1, delay: d }}
                                className="w-2 h-2 rounded-full bg-rose-300"
                              />
                            ))}
                            <span className="text-[12px] text-stone-300 ml-2">老袁正在分析中...</span>
                          </div>
                        ) : (
                          <p className="text-[13px] text-stone-600 leading-relaxed tracking-wide whitespace-pre-wrap">
                            {diagnosis || "暂无诊断数据"}
                          </p>
                        )}
                        <p className="text-[9px] text-stone-300 mt-3 text-right">老袁 · AI 诊断</p>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === "categories" && (
                  <motion.div key="categories" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                    {latestCategories ? (
                      <>
                        <section className="bg-rose-50/30 rounded-2xl border border-rose-100/40 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm">🎯</span>
                            <h3 className="text-[12px] font-medium text-stone-600 tracking-wide">知识维度分布</h3>
                          </div>
                          <RadarChart categories={latestCategories} />
                        </section>
                        <section>
                          <h3 className="text-[12px] font-medium text-stone-600 tracking-wide mb-3 px-1">各维度得分率</h3>
                          <div className="space-y-3">
                            {Object.entries(CAT_MAX)
                              .filter(([k]) => latestCategories[k as keyof CategoryScores] != null)
                              .map(([k, max]) => {
                                const val = latestCategories[k as keyof CategoryScores] as number;
                                const pct = val / max;
                                return (
                                  <div key={k} className="space-y-1">
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-stone-500 tracking-wide">{CAT_CN[k] ?? k}</span>
                                      <span className={`font-medium tabular-nums ${pct >= 0.8 ? "text-emerald-500" : pct >= 0.6 ? "text-amber-500" : "text-rose-400"}`}>
                                        {val}/{max}
                                      </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }}
                                        transition={{ duration: 0.7, ease: "easeOut" }} className="h-full rounded-full"
                                        style={{ background: CAT_COLORS[k] ?? "#c88080" }} />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </section>
                        {sorted.length >= 2 && (
                          <section>
                            <h3 className="text-[12px] font-medium text-stone-600 tracking-wide mb-3 px-1">维度历次变化</h3>
                            <div className="space-y-2">
                              {Object.entries(CAT_MAX)
                                .filter(([k]) => sorted.some((g) => g.categories?.[k as keyof CategoryScores] != null))
                                .map(([k]) => {
                                  const series = sorted
                                    .filter((g) => g.categories?.[k as keyof CategoryScores] != null)
                                    .map((g) => g.categories![k as keyof CategoryScores] as number);
                                  if (series.length < 2) return null;
                                  const diff = series[series.length - 1] - series[0];
                                  return (
                                    <div key={k} className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50">
                                      <span className="text-[11px] text-stone-500">{CAT_CN[k] ?? k}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-stone-400 tabular-nums">{series[0]} → {series[series.length - 1]}</span>
                                        <span className={`text-[11px] font-medium tabular-nums ${diff > 0 ? "text-emerald-500" : diff < 0 ? "text-rose-400" : "text-stone-300"}`}>
                                          {diff > 0 ? `+${diff}` : diff}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </section>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                        <span className="text-2xl opacity-30">📊</span>
                        <p className="text-[12px] text-stone-300 tracking-wide">未录入维度分数</p>
                        <p className="text-[10px] text-stone-300/60 tracking-wide max-w-[260px]">
                          录入成绩时使用增强格式，如：「张三 88 | 文言文:18 现代文:22 作文:20」即可展示维度分析
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "errors" && (
                  <motion.div key="errors" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                    {(() => {
                      const allErrors = sorted.flatMap((g) => g.errors ?? []);
                      if (allErrors.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                            <span className="text-2xl opacity-30">📭</span>
                            <p className="text-[12px] text-stone-300 tracking-wide">暂无错题数据</p>
                            <p className="text-[10px] text-stone-300/60 tracking-wide max-w-[260px]">
                              录入成绩时在末尾添加「| 错:标签1,标签2」即可记录错题
                            </p>
                          </div>
                        );
                      }
                      const freq: Record<string, number> = {};
                      allErrors.forEach((e) => { freq[e] = (freq[e] ?? 0) + 1; });
                      const maxFreq = Math.max(...Object.values(freq));
                      const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
                      return (
                        <>
                          <section>
                            <h3 className="text-[12px] font-medium text-stone-600 tracking-wide mb-3 px-1">
                              错题标签分布 <span className="text-stone-300 font-normal">({allErrors.length} 条)</span>
                            </h3>
                            <div className="space-y-2.5">
                              {entries.map(([tag, count]) => (
                                <div key={tag} className="space-y-1">
                                  <div className="flex justify-between text-[11px]">
                                    <span className={`font-medium tracking-wide ${count >= 3 ? "text-rose-500" : "text-stone-500"}`}>{tag}</span>
                                    <span className="text-stone-300 tabular-nums">{count}次</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxFreq) * 100}%` }}
                                      transition={{ duration: 0.6, ease: "easeOut" }} className="h-full rounded-full bg-rose-300/70" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                          <section>
                            <h3 className="text-[12px] font-medium text-stone-600 tracking-wide mb-3 px-1">历次考试错题明细</h3>
                            <div className="space-y-3">
                              {sorted
                                .filter((g) => g.errors && g.errors.length > 0)
                                .map((g) => (
                                  <div key={g.examName} className="bg-white rounded-xl border border-stone-100 px-4 py-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[12px] font-medium text-stone-600">{g.examName}</span>
                                      <span className="text-[11px] text-stone-300">{g.date}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(g.errors ?? []).map((e) => (
                                        <span key={e} className="px-2.5 py-1 rounded-lg bg-rose-50 text-[11px] text-rose-400 tracking-wide">{e}</span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </section>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
