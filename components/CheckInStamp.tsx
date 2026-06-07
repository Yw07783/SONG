"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── Mock 数据 ────────────────────────────── */

const STAMP_VARIANTS = [
  { emoji: "🌸", label: "积跬步", color: "text-rose-400/80" },
  { emoji: "🌿", label: "日有所进", color: "text-rose-500/70" },
  { emoji: "✨", label: "冲刺日", color: "text-rose-400/80" },
  { emoji: "📖", label: "刷题日", color: "text-rose-500/70" },
  { emoji: "✍️", label: "练笔日", color: "text-rose-400/80" },
  { emoji: "🧘", label: "休整日", color: "text-stone-400/60" },
];

interface StampRecord {
  date: string;
  variant: number; // index into STAMP_VARIANTS
  msg: string;
}

const TODAY_KEY = "checkin_today_2026";

/** 检测今日是否已完成 ≥1 个任务（通过 localStorage 日记或题目完成状态判断） */
function hasTodayActivity(): boolean {
  if (typeof window === "undefined") return false;
  const today = new Date().toISOString().slice(0, 10);

  // 1. 日记
  const diaries = JSON.parse(localStorage.getItem("jiaozhao_diaries") ?? "[]") as string[];
  if (diaries.some((d) => d.startsWith(today))) return true;

  // 2. 闪卡完成标记
  const flashDone = localStorage.getItem(`flashcard_done_${today}`);
  if (flashDone === "true") return true;

  // 3. 时间滑块 ≥ 75 min（Mock 判定为"完成学习"）
  const studyMin = localStorage.getItem(`study_minutes_${today}`);
  if (studyMin && parseInt(studyMin, 10) >= 75) return true;

  return false;
}

function stampIfEligible(): StampRecord | null {
  if (typeof window === "undefined") return null;
  const today = new Date().toISOString().slice(0, 10);
  const already = localStorage.getItem(TODAY_KEY);
  if (already === today) return null; // 今天已打卡
  if (!hasTodayActivity()) return null;

  // 随机选择印章变体
  const idx = Math.floor(Math.random() * (STAMP_VARIANTS.length - 1)); // 不含休整日
  const stamp: StampRecord = {
    date: today,
    variant: idx,
    msg: STAMP_VARIANTS[idx].label,
  };

  // 持久化
  const history = getStampHistory();
  history.push(stamp);
  localStorage.setItem("checkin_history", JSON.stringify(history));
  localStorage.setItem(TODAY_KEY, today);

  return stamp;
}

function getStampHistory(): StampRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("checkin_history") ?? "[]");
  } catch {
    return [];
  }
}

/* ── 组件 ─────────────────────────────────── */

export default function CheckInStamp() {
  const [todayStamp, setTodayStamp] = useState<StampRecord | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 检查是否可以打卡
    const result = stampIfEligible();
    if (result) {
      setStamped(true);
      setTodayStamp(result);
    } else {
      // 今天已打卡 → 显示已有印章
      const today = new Date().toISOString().slice(0, 10);
      const hist = getStampHistory();
      const found = hist.find((s) => s.date === today);
      if (found) {
        setTodayStamp(found);
        setStamped(true);
      }
    }
  }, []);

  const seed = useCallback((key: string) => {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return h;
  }, []);

  if (!mounted) return null;

  const history = getStampHistory();
  // 去重按日期排序（最近在前）
  const unique = history
    .filter((s, i, arr) => arr.findLastIndex((x) => x.date === s.date) === i)
    .sort((a, b) => b.date.localeCompare(a.date));

  const dailyStreak = (() => {
    let streak = 0;
    const today = new Date();
    for (let d = 0; d < 200; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const ds = date.toISOString().slice(0, 10);
      const found = unique.find((s) => s.date === ds);
      if (found && !found.msg.includes("休整")) {
        streak++;
      } else if (d === 0) {
        continue; // today might not be stamped yet
      } else {
        break;
      }
    }
    return streak;
  })();

  return (
    <div className="flex flex-col items-center gap-2">
      {/* ── 今日印章 ──────────────────── */}
      <AnimatePresence>
        {stamped && todayStamp ? (
          <motion.div
            initial={{ scale: 0, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className="flex flex-col items-center gap-1 cursor-pointer select-none"
            onClick={() => setHistoryOpen((v) => !v)}
          >
            {/* 印章外圈 */}
            <div className="relative w-20 h-20 rounded-full border-2 border-rose-200/60 flex items-center justify-center bg-rose-50/30 shadow-[0_2px_12px_-4px_rgba(180,130,130,0.15)]">
              {/* 齿轮状装饰 */}
              <div className="absolute inset-1 rounded-full border border-rose-200/30" />
              <span className="text-2xl relative z-10">{todayStamp.emoji}</span>
            </div>
            {/* 印章文字 */}
            <span
              className="text-[12px] font-medium tracking-widest"
              style={{
                color: "var(--a500)",
                writingMode: "horizontal-tb",
              }}
            >
              {todayStamp.msg}
            </span>
            <span className="text-[10px] text-stone-300 tracking-wide">
              {todayStamp.date.slice(5)}
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50/30">
              <span className="text-[20px] text-stone-300">?</span>
            </div>
            <span className="text-[11px] text-stone-300 tracking-wide">
              待打卡
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 连续打卡 */}
      <p className="text-[11px] text-stone-300 tracking-wide text-center">
        {dailyStreak > 0 ? `🔥 连续 ${dailyStreak} 天` : "今天开始吧"}
      </p>

      {/* ── 打卡记录墙 ──────────────── */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden w-full max-w-xs"
          >
            <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_4px_20px_-8px_rgba(140,100,100,0.1)] px-5 pt-4 pb-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">
                  印章收集墙
                </p>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="text-stone-300 hover:text-stone-400 text-[12px]"
                >
                  ✕
                </button>
              </div>

              {unique.length === 0 ? (
                <p className="text-[12px] text-stone-300 text-center py-4 tracking-wide">
                  还没有印章，今天开始积跬步吧 🌸
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2.5">
                  {unique.map((s) => (
                    <motion.div
                      key={s.date}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                        delay: s.date.length * 0.02,
                      }}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl bg-rose-50/40"
                    >
                      <span className="text-xl">{s.emoji}</span>
                      <span className="text-[9px] text-stone-400 tracking-wide">
                        {s.date.slice(5)}
                      </span>
                      <span className={`text-[9px] font-medium tracking-wide ${STAMP_VARIANTS[s.variant].color}`}>
                        {s.msg}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
