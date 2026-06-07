"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudentProfileDrawer from "./StudentProfileDrawer";

/* ══════════════════════════════════════════════
 * 类型定义
 * ══════════════════════════════════════════════ */

export interface CategoryScores {
  文言文?: number;
  现代文阅读?: number;
  作文?: number;
  古诗鉴赏?: number;
  基础知识?: number;
  教学设计?: number;
}

export interface StudentGrade {
  student: string;
  score: number;
  categories?: CategoryScores;
  errors?: string[];
}

export interface ExamRecord {
  id: string;
  examName: string;
  date: string;
  grades: StudentGrade[];
}

export interface StudentGradePoint {
  examName: string;
  date: string;
  score: number;
  categories?: CategoryScores;
  errors?: string[];
}

export interface ClassAvgPoint {
  examName: string;
  date: string;
  avg: number;
}

/* ── 预计算的学情分析摘要（存到 analytics key） ── */

export interface StudentAnalytics {
  student: string;
  avgScore: number;
  maxScore: number;
  minScore: number;
  examCount: number;
  trend: "显著上升" | "稳步上升" | "保持稳定" | "小幅下滑" | "明显下滑";
  trendDelta: number;
  weakestDim?: string;
  weakestPct: number;
  topErrors: string[];
  lastExamName: string;
  lastExamDate: string;
  updatedAt: string;
}

/* ══════════════════════════════════════════════
 * 常量
 * ══════════════════════════════════════════════ */

const STORAGE_KEY = "jiaozhao_class_grades";
const ANALYTICS_KEY = "jiaozhao_class_analytics";

const CATEGORY_KEYS: Record<string, string> = {
  文言文: "文言文",
  现代文阅读: "现代文阅读",
  作文: "作文",
  古诗鉴赏: "古诗鉴赏",
  基础知识: "基础知识",
  教学设计: "教学设计",
};

const CATEGORY_MAX: Record<string, number> = {
  文言文: 20,
  现代文阅读: 25,
  作文: 25,
  古诗鉴赏: 15,
  基础知识: 10,
  教学设计: 5,
};

/* ══════════════════════════════════════════════
 * localStorage 工具
 * ══════════════════════════════════════════════ */

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* quota exceeded — ignore */ }
}

function loadGrades(): ExamRecord[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as ExamRecord[];
  } catch {
    return [];
  }
}

function saveGrades(data: ExamRecord[]) {
  safeSetItem(STORAGE_KEY, JSON.stringify(data));
}

function saveAnalytics(data: StudentAnalytics[]) {
  safeSetItem(ANALYTICS_KEY, JSON.stringify(data));
}

export function loadAnalytics(): StudentAnalytics[] {
  try {
    const raw = safeGetItem(ANALYTICS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as StudentAnalytics[];
  } catch {
    return [];
  }
}

/* ══════════════════════════════════════════════
 * 稳健解析器
 * ══════════════════════════════════════════════ */

/**
 * 容忍多余空格、中英文标点混用、空行、额外注释行。
 * 返回 null 表示无法解析（静默失败，不弹错误）。
 */

/* 维度分片段：key:val 或 key：val，中间可无空格 */
const CATEGORY_FRAGMENT_RE = /([一-鿿\w]+)\s*[：:]\s*(\d+(?:\.\d+)?)/g;

/* 错题片段：前缀 "错:" 或 "错：" 或 "错题:" */
const ERROR_PREFIX_RE = /^错(?:题)?[：:]\s*/;

function parseCategoriesSegment(seg: string): CategoryScores | null {
  const cats: Record<string, number> = {};
  for (const m of seg.matchAll(CATEGORY_FRAGMENT_RE)) {
    const k = m[1].trim();
    const v = parseFloat(m[2]);
    if (k in CATEGORY_KEYS && !isNaN(v) && v >= 0) {
      cats[k] = v;
    }
  }
  return Object.keys(cats).length > 0 ? (cats as CategoryScores) : null;
}

function parseErrorsSegment(seg: string): string[] {
  const cleaned = seg.replace(ERROR_PREFIX_RE, "");
  return cleaned
    .split(/[,，、\s]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.length <= 20);
}

function parseGradeText(raw: string): ExamRecord | null {
  /* 1. 拆行并去空 */
  const lines = raw
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  /* 2. 解析标题行 */
  const headerLine = lines[0];
  const headerMatch = headerLine.match(/^(.+?)\s*[,，]\s*(.+)$/);
  if (!headerMatch) return null;

  const examName = headerMatch[1].trim();
  if (examName.length === 0 || examName.length > 100) return null;

  const dateStr = headerMatch[2].trim();
  const date = /^\d{4}[./-]\d{1,2}[./-]\d{1,2}$/.test(dateStr)
    ? dateStr.replace(/[./]/g, "-")
    : new Date().toISOString().slice(0, 10);

  /* 3. 逐行解析学生成绩 */
  const grades: StudentGrade[] = [];
  const seenNames = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    /* 跳过明显非数据行 */
    if (line.length < 2 || /^[#/\-\*]/.test(line)) continue;

    /* 尝试增强格式：姓名 分数 | 维度段 | 错题段 */
    const enhancedMatch = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:\|\s*(.+))?$/);
    if (enhancedMatch) {
      const name = enhancedMatch[1].trim();
      const score = parseFloat(enhancedMatch[2]);

      /* 合法性校验 */
      if (!name || name.length > 30 || seenNames.has(name)) continue;
      if (isNaN(score) || score < 0 || score > 100) continue;
      seenNames.add(name);

      const grade: StudentGrade = { student: name, score };
      const rest = enhancedMatch[3];

      if (rest) {
        const segments = rest.split("|").map((p) => p.trim()).filter(Boolean);

        for (const seg of segments) {
          if (ERROR_PREFIX_RE.test(seg)) {
            grade.errors = parseErrorsSegment(seg);
          } else {
            const cats = parseCategoriesSegment(seg);
            if (cats) grade.categories = cats;
          }
        }
      }
      grades.push(grade);
      continue;
    }

    /* 简版格式：姓名 分数 */
    const simpleMatch = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*$/);
    if (simpleMatch) {
      const name = simpleMatch[1].trim();
      const score = parseFloat(simpleMatch[2]);
      if (!name || name.length > 30 || seenNames.has(name)) continue;
      if (isNaN(score) || score < 0 || score > 100) continue;
      seenNames.add(name);
      grades.push({ student: name, score });
    }
    /* 不匹配的行静默丢弃 */
  }

  if (grades.length === 0) return null;
  return { id: `exam_${Date.now()}`, examName, date, grades };
}

/* ══════════════════════════════════════════════
 * 派生 analytics 摘要
 * ══════════════════════════════════════════════ */

function computeAnalytics(exams: ExamRecord[]): StudentAnalytics[] {
  const map = new Map<string, StudentGradePoint[]>();

  for (const e of exams) {
    for (const g of e.grades) {
      if (!map.has(g.student)) map.set(g.student, []);
      map.get(g.student)!.push({
        examName: e.examName,
        date: e.date,
        score: g.score,
        categories: g.categories,
        errors: g.errors,
      });
    }
  }

  const results: StudentAnalytics[] = [];

  for (const [name, points] of map) {
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    const scores = sorted.map((p) => p.score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const last = sorted[sorted.length - 1];
    const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
    const diff = prev ? last.score - prev.score : 0;

    let trend: StudentAnalytics["trend"] = "保持稳定";
    if (sorted.length >= 2) {
      if (diff >= 8) trend = "显著上升";
      else if (diff >= 3) trend = "稳步上升";
      else if (diff <= -8) trend = "明显下滑";
      else if (diff <= -3) trend = "小幅下滑";
    }

    /* 最弱维度 */
    const errFreq: Record<string, number> = {};
    sorted.forEach((p) => p.errors?.forEach((e) => { errFreq[e] = (errFreq[e] ?? 0) + 1; }));
    const topErrors = Object.entries(errFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);

    let weakestDim: string | undefined;
    let weakestPct = 1;
    const latestCat = last.categories;
    if (latestCat) {
      for (const [k, maxV] of Object.entries(CATEGORY_MAX)) {
        const v = latestCat[k as keyof CategoryScores] as number | undefined;
        if (v != null) {
          const pct = v / maxV;
          if (pct < weakestPct) {
            weakestPct = pct;
            weakestDim = k;
          }
        }
      }
    }

    results.push({
      student: name,
      avgScore: avg,
      maxScore: max,
      minScore: min,
      examCount: sorted.length,
      trend,
      trendDelta: diff,
      weakestDim,
      weakestPct: weakestDim ? weakestPct : 1,
      topErrors,
      lastExamName: last.examName,
      lastExamDate: last.date,
      updatedAt: new Date().toISOString(),
    });
  }

  return results;
}

/* ══════════════════════════════════════════════
 * 班级均分趋势图 (SVG)
 * ══════════════════════════════════════════════ */

function ClassTrendChart({ exams }: { exams: ExamRecord[] }) {
  if (exams.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-[13px] text-stone-300 tracking-wide">暂无考试数据，请先录入成绩</p>
      </div>
    );
  }

  const averages = exams.map((e) => {
    const sum = e.grades.reduce((s, g) => s + g.score, 0);
    return Math.round(sum / Math.max(e.grades.length, 1));
  });

  const maxes = exams.map((e) => Math.max(...e.grades.map((g) => g.score)));
  const mins = exams.map((e) => Math.min(...e.grades.map((g) => g.score)));

  const w = 520; const h = 200;
  const pad = { top: 16, right: 20, bottom: 36, left: 38 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxScore = 100;
  const minScore = Math.max(0, Math.min(...averages, ...mins) - 10);

  const avgLine = averages.map((v, i) => {
    const x = pad.left + (i / Math.max(averages.length - 1, 1)) * plotW;
    const y = pad.top + plotH - ((v - minScore) / (maxScore - minScore)) * plotH;
    return `${x},${y}`;
  }).join(" ");

  const yTicks = [minScore, Math.round((minScore + maxScore) / 2), maxScore].map((v) => Math.round(v));

  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[400px] h-auto">
        {yTicks.map((v) => {
          const y = pad.top + plotH - ((v - minScore) / (maxScore - minScore)) * plotH;
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#f0e8e8" strokeWidth="0.5" strokeDasharray="4,3" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-stone-300">{v}</text>
            </g>
          );
        })}

        {/* 区间带 */}
        {exams.map((_, i) => {
          if (i >= averages.length) return null;
          const x = pad.left + (i / Math.max(averages.length - 1, 1)) * plotW;
          const yMax = pad.top + plotH - ((maxes[i] - minScore) / (maxScore - minScore)) * plotH;
          const yMin = pad.top + plotH - ((mins[i] - minScore) / (maxScore - minScore)) * plotH;
          return (
            <line key={i} x1={x} y1={yMax} x2={x} y2={yMin}
              stroke="#e8c8c8" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
          );
        })}

        <defs>
          <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8b8b8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e8b8b8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon
          points={`${pad.left},${pad.top + plotH} ${avgLine} ${pad.left + (averages.length - 1 === 0 ? 0 : plotW)},${pad.top + plotH}`}
          fill="url(#gradeGrad)" />
        <polyline points={avgLine} fill="none" stroke="#c88080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {averages.map((v, i) => {
          const x = pad.left + (i / Math.max(averages.length - 1, 1)) * plotW;
          const y = pad.top + plotH - ((v - minScore) / (maxScore - minScore)) * plotH;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill="#fff" stroke="#c88080" strokeWidth="2" />
              <text x={x} y={y - 14} textAnchor="middle" className="text-[10px] fill-stone-500 font-medium">{v}分</text>
              <text x={x} y={h - 4} textAnchor="middle" className="text-[10px] fill-stone-300">
                {exams[i].examName.length > 5 ? exams[i].examName.slice(0, 5) + "…" : exams[i].examName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════
 * Sparkline 迷你趋势线
 * ══════════════════════════════════════════════ */

function Sparkline({ values, width, height }: { values: number[]; width: number; height: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline points={points} fill="none" stroke="#d4a0a0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════
 * 学生卡片
 * ══════════════════════════════════════════════ */

function StudentCard({
  name,
  grades,
  analytics,
  onSelect,
}: {
  name: string;
  grades: { examName: string; date: string; score: number; errors?: string[] }[];
  analytics?: StudentAnalytics;
  onSelect: () => void;
}) {
  const sorted = [...grades].sort((a, b) => a.date.localeCompare(b.date));
  const sparkVals = sorted.map((g) => g.score);

  const a = analytics;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0 6px 22px -10px rgba(180,130,130,0.14)" }}
      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-stone-100 text-left transition-all duration-200 touch-target card-hover"
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-rose-100/60 flex items-center justify-center">
        <span className="text-[15px] font-medium text-rose-500">{name.slice(0, 1)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-medium text-stone-600 tracking-wide truncate">{name}</p>
          {a && a.trendDelta !== 0 && (
            <span className={`shrink-0 text-[11px] font-medium ${a.trendDelta > 0 ? "text-emerald-500" : "text-rose-400"}`}>
              {a.trendDelta > 0 ? `+${a.trendDelta}` : a.trendDelta}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-[11px] text-stone-300 tracking-wide">
            {a ? `${a.examCount} 次 · 均分${a.avgScore} · ${a.trend}` : `${sorted.length} 次`}
          </p>
        </div>
        {a && a.topErrors.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            {a.topErrors.slice(0, 2).map((e) => (
              <span key={e} className="px-2 py-0.5 rounded-md bg-rose-50 text-[10px] text-rose-400 tracking-wide">{e}</span>
            ))}
          </div>
        )}
      </div>

      <Sparkline values={sparkVals} width={52} height={28} />
    </motion.button>
  );
}

/* ══════════════════════════════════════════════
 * 主组件
 * ══════════════════════════════════════════════ */

export default function GradeTracker() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [analytics, setAnalytics] = useState<StudentAnalytics[]>([]);
  const [inputText, setInputText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<StudentGradePoint[]>([]);
  const [classAverages, setClassAverages] = useState<ClassAvgPoint[]>([]);
  const [selectedAnalytics, setSelectedAnalytics] = useState<StudentAnalytics | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const loadedExams = loadGrades();
    setExams(loadedExams);
    setAnalytics(computeAnalytics(loadedExams));
  }, []);

  /* ── 导入 ──────────────────── */
  const handleImport = useCallback(() => {
    const raw = inputText.trim();
    if (!raw) return;
    const record = parseGradeText(raw);
    if (!record) {
      /* 解析失败 — 静默，不清空输入框让用户自己修正 */
      return;
    }
    const updatedExams = [...exams, record];
    setExams(updatedExams);
    saveGrades(updatedExams);

    const updatedAnalytics = computeAnalytics(updatedExams);
    setAnalytics(updatedAnalytics);
    saveAnalytics(updatedAnalytics);

    setInputText("");
    setShowInput(false);
  }, [inputText, exams]);

  const handleClear = useCallback(() => {
    if (typeof window === "undefined") return;
    setExams([]);
    setAnalytics([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ANALYTICS_KEY);
  }, []);

  /* ── 打开学生档案（含 analytics） ─ */
  const handleSelectStudent = useCallback(
    (name: string) => {
      const pointList: StudentGradePoint[] = [];
      for (const e of exams) {
        const found = e.grades.find((g) => g.student === name);
        if (found) {
          pointList.push({
            examName: e.examName,
            date: e.date,
            score: found.score,
            categories: found.categories,
            errors: found.errors,
          });
        }
      }

      const avgList: ClassAvgPoint[] = exams.map((e) => ({
        examName: e.examName,
        date: e.date,
        avg: Math.round(e.grades.reduce((s, g) => s + g.score, 0) / Math.max(e.grades.length, 1)),
      }));

      const aResult = analytics.find((a) => a.student === name);

      setSelectedStudent(name);
      setSelectedGrades(pointList);
      setClassAverages(avgList);
      setSelectedAnalytics(aResult);
      setDrawerOpen(true);
    },
    [exams, analytics],
  );

  /* ── 聚合学生 ──────────────── */
  const students = useMemo(() => {
    const map = new Map<string, { examName: string; date: string; score: number; errors?: string[] }[]>();
    for (const e of exams) {
      for (const g of e.grades) {
        if (!map.has(g.student)) map.set(g.student, []);
        map.get(g.student)!.push({
          examName: e.examName,
          date: e.date,
          score: g.score,
          errors: g.errors,
        });
      }
    }
    return Array.from(map.entries())
      .map(([name, gradeList]) => ({ name, grades: gradeList }))
      .sort((a, b) => {
        const aLatest = a.grades.reduce((max, g) => (g.date > max ? g.date : max), "");
        const bLatest = b.grades.reduce((max, g) => (g.date > max ? g.date : max), "");
        return bLatest.localeCompare(aLatest);
      });
  }, [exams]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* ── 顶部操作栏 ────────────── */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">成绩看板</p>
          <h3 className="text-[15px] font-medium text-stone-700 tracking-wide mt-1">
            多考成绩 · 成长曲线
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {exams.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded-xl text-[12px] text-stone-300 bg-stone-50 border border-stone-200 tracking-wide transition-all duration-200 hover:bg-stone-100 active:scale-[0.97] touch-target"
            >
              清空
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowInput((v) => !v)}
            className={`px-5 py-2 rounded-xl text-[13px] font-medium tracking-wide transition-all duration-200 active:scale-[0.97] touch-target ${
              showInput ? "bg-stone-100 text-stone-500" : "text-white"
            }`}
            style={
              showInput ? undefined : {
                background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
                boxShadow: "0 4px 14px -6px rgba(180,120,120,0.35)",
              }
            }
          >
            {showInput ? "收起" : "+ 录入新成绩"}
          </button>
        </div>
      </div>

      {/* ── 录入面板 ────────────── */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0 mt-0.5">📋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-600 tracking-wide mb-1">批量录入成绩</p>
                  <div className="text-[11px] text-stone-300 tracking-wide leading-relaxed space-y-1">
                    <p><span className="text-stone-400 font-medium">简版：</span>每行「姓名 分数」</p>
                    <p><span className="text-stone-400 font-medium">增强版：</span>支持维度分和错题标签</p>
                    <p className="text-stone-300/60">「姓名 总分 | 文言文:18 现代文:22 | 错:实词辨析,主旨概括」</p>
                  </div>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={7}
                placeholder={`单元测验2, 2026-04-10\n张三 88 | 文言文:18 现代文:22 作文:20 古诗:16 基础:12 | 错:实词辨析\n李四 76 | 文言文:14 现代文:18 作文:18 古诗:14 基础:12 | 错:主旨概括,修辞手法\n王五 82 | 文言文:16 现代文:20 作文:19 古诗:15 基础:12`}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-[13px] text-stone-600 placeholder-stone-300 tracking-wide leading-relaxed resize-none focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all duration-200 font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button" onClick={() => setShowInput(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] text-stone-400 bg-stone-50 border border-stone-200 tracking-wide transition-all duration-200 hover:bg-stone-100 active:scale-[0.97] touch-target"
                >
                  取消
                </button>
                <button
                  type="button" onClick={handleImport} disabled={!inputText.trim()}
                  className="px-6 py-2.5 rounded-xl text-[13px] font-medium tracking-wide text-white transition-all duration-200 active:scale-[0.97] touch-target disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)", boxShadow: "0 4px 16px -6px rgba(180,120,120,0.4)" }}
                >
                  解析并入库
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 班级均分趋势 ────────────── */}
      <section className="shrink-0 bg-white rounded-2xl border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">📊</span>
          <h3 className="text-[14px] font-medium text-stone-600 tracking-wide">班级平均分趋势</h3>
          {exams.length > 0 && <span className="text-[11px] text-stone-300 ml-auto">{exams.length} 次考试</span>}
        </div>
        <ClassTrendChart exams={exams} />
      </section>

      {/* ── 学生名册 ────────────── */}
      <section className="flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">👥</span>
          <h3 className="text-[14px] font-medium text-stone-600 tracking-wide">学生个性化档案</h3>
          <span className="text-[11px] text-stone-300 ml-auto">点击查看全面分析</span>
        </div>

        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
            <span className="text-3xl opacity-30">📭</span>
            <p className="text-[13px] text-stone-300 tracking-wide">暂无学生数据</p>
            <p className="text-[11px] text-stone-300/60 tracking-wide max-w-[320px]">
              点击上方「录入新成绩」粘贴数据。支持简版和增强版格式。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
            {students.map((s) => {
              const a = analytics.find((x) => x.student === s.name);
              return (
                <StudentCard
                  key={s.name}
                  name={s.name}
                  grades={s.grades}
                  analytics={a}
                  onSelect={() => handleSelectStudent(s.name)}
                />
              );
            })}
          </div>
        )}
      </section>

      <StudentProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        studentName={selectedStudent}
        grades={selectedGrades}
        classAverages={classAverages}
        analytics={selectedAnalytics}
      />
    </div>
  );
}
