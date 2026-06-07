"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ═══════════════════════════════════════════════
   1. 听题播客（升级：迷你播放列表 + 频道切换）
   ═══════════════════════════════════════════════ */

interface PodcastChannel {
  label: string;
  desc: string;
}

const PODCAST_CHANNELS: PodcastChannel[] = [
  { label: "教综必背考点", desc: "教育学 · 心理学核心条目" },
  { label: "初中文言文全集", desc: "部编版 7-9 年级逐篇朗读" },
  { label: "新课标语音导读", desc: "2022 版课标重点章节解读" },
];

function AudioPodcast() {
  const [playing, setPlaying] = useState(false);
  const [channelIdx, setChannelIdx] = useState(0);
  const current = PODCAST_CHANNELS[channelIdx];

  const handleChannel = useCallback((idx: number) => {
    if (idx === channelIdx) return;
    setChannelIdx(idx);
    setPlaying(true); // 切频道自动播放
  }, [channelIdx]);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🎧</span>
        <div>
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">听题播客</p>
          <p className="text-[13px] text-stone-500 tracking-wide mt-0.5">磨耳朵 · 碎片记忆</p>
        </div>
      </div>

      {/* 播放卡片 */}
      <div className="flex flex-col items-center justify-center gap-4 bg-rose-50/50 rounded-2xl px-4 py-6 mb-4">
        {/* 正在播放（Fade 切换） */}
        <AnimatePresence mode="wait">
          <motion.div
            key={channelIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-center"
          >
            <p className="text-[12px] text-stone-400 tracking-wide">正在播放</p>
            <p className="text-[15px] font-medium text-stone-700 tracking-wide mt-0.5">
              {current.label}
            </p>
            <p className="text-[11px] text-stone-300 tracking-wide mt-0.5">
              {current.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 播放/暂停 按钮 */}
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className={`
            flex items-center justify-center w-14 h-14 rounded-full
            transition-all duration-300 touch-target
            ${playing
              ? "bg-rose-400/80 text-white shadow-[0_4px_16px_-6px_rgba(180,130,130,0.5)]"
              : "bg-white text-rose-400 border-2 border-rose-200 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]"
            }
          `}
          aria-label={playing ? "暂停" : "播放"}
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36A1 1 0 0 0 8 5.14z" />
            </svg>
          )}
        </button>

        {/* 进度条 */}
        <div className="w-full h-1 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-300/70 transition-all duration-1000"
            style={{
              width: playing ? "45%" : "0%",
              transition: playing ? "width 18s linear" : "none",
            }}
          />
        </div>
      </div>

      {/* 迷你播放列表 */}
      <div className="space-y-1.5">
        {PODCAST_CHANNELS.map((ch, i) => (
          <button
            key={ch.label}
            type="button"
            onClick={() => handleChannel(i)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-[13px] tracking-wide text-left
              transition-all duration-200 touch-target
              ${i === channelIdx
                ? "bg-rose-50/80 text-rose-600 font-medium"
                : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
              }
            `}
          >
            <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] ${i === channelIdx ? "bg-rose-200/50 text-rose-500" : "bg-stone-100 text-stone-300"}`}>
              {i === channelIdx && playing ? (
                <span className="flex gap-px">
                  <span className="w-0.5 h-2.5 bg-current rounded-full animate-pulse" />
                  <span className="w-0.5 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-0.5 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                </span>
              ) : (
                i + 1
              )}
            </span>
            <span>{ch.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   2. 知识闪卡（升级：6 题动态牌库 + 进度 + 完成）
   ═══════════════════════════════════════════════ */

interface CardItem {
  q: string;
  a: string[];
}

const FLASHCARD_DECK: CardItem[] = [
  {
    q: "《语文课程标准》\n四大核心素养",
    a: ["文化自信", "语言运用", "思维能力", "审美创造"],
  },
  {
    q: "教学过程的\n基本阶段",
    a: ["激发学习动机", "感知教材", "理解教材", "巩固知识", "运用知识", "检查反馈"],
  },
  {
    q: "一堂好课的\n基本要求",
    a: ["目标明确", "内容正确", "方法得当", "结构合理", "语言艺术", "气氛热烈"],
  },
  {
    q: "班主任工作的\n主要内容",
    a: ["了解研究学生", "组织和培养班集体", "做好个别教育", "协调各方教育力量", "做好班主任工作计划与总结"],
  },
  {
    q: "初中生常见的\n心理发展特点",
    a: ["自我意识觉醒 · 成人感", "情绪两极性 · 易冲动", "同伴影响力上升", "抽象逻辑思维占主导"],
  },
  {
    q: "语文课堂提问\n的设计原则",
    a: ["启发性 · 激活思维", "层次性 · 由浅入深", "针对性 · 紧扣目标", "适度性 · 留足思考时间"],
  },
];

function Flashcard() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [transitioning, setTransitioning] = useState(false); // 翻回动画进行中
  const [done, setDone] = useState(false);

  const total = FLASHCARD_DECK.length;
  const current = FLASHCARD_DECK[idx];

  /* 翻面 */
  const handleFlip = useCallback(() => {
    if (transitioning || done) return;
    setFlipped((v) => !v);
  }, [transitioning, done]);

  /* 下一张 */
  const handleNext = useCallback(() => {
    if (transitioning) return;

    if (idx >= total - 1) {
      // 最后一张 → 完成
      setFlipped(true); // 先翻到背面展示答案
      setTransitioning(true);
      setTimeout(() => {
        setDone(true);
        // 标记今日闪卡完成（供打卡印章检测）
        if (typeof window !== "undefined") {
          const today = new Date().toISOString().slice(0, 10);
          localStorage.setItem(`flashcard_done_${today}`, "true");
        }
        setTransitioning(false);
      }, 600);
      return;
    }

    if (flipped) {
      // 正在看答案 → 先翻回正面
      setFlipped(false);
      setTransitioning(true);
      setTimeout(() => {
        setIdx((i) => i + 1);
        setTransitioning(false);
      }, 350); // 翻回正面一半时切换内容
    } else {
      // 正处在正面 → 直接切下一张
      setTransitioning(true);
      setTimeout(() => {
        setIdx((i) => i + 1);
        setTransitioning(false);
      }, 200);
    }
  }, [idx, flipped, transitioning, total]);

  /* 键盘支持 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (done) return;
        handleFlip();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleFlip, handleNext, done]);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📇</span>
          <div>
            <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">知识闪卡</p>
            <p className="text-[13px] text-stone-500 tracking-wide mt-0.5">
              {done ? "全部完成" : "点击翻面 · 自测回忆"}
            </p>
          </div>
        </div>

        {/* 进度指示 */}
        {!done && (
          <span className="text-[12px] text-stone-300 tracking-wide tabular-nums">
            {idx + 1}/{total}
          </span>
        )}
      </div>

      {/* 卡片区 */}
      {done ? (
        /* ── 完成态 ──────────────────────── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="flex-1 flex flex-col items-center justify-center gap-3 bg-rose-50/60 rounded-2xl px-4 py-8 text-center"
        >
          <span className="text-4xl">🎉</span>
          <p className="text-[15px] font-medium text-stone-600 tracking-wide">
            今日闪卡已刷完
          </p>
          <p className="text-[13px] text-stone-400 tracking-wide">
            碎片时间利用率 100%！
          </p>
          <button
            type="button"
            onClick={() => { setIdx(0); setFlipped(false); setDone(false); }}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-rose-400/80 text-white text-[13px] font-medium tracking-wide shadow-[0_4px_12px_-4px_rgba(180,130,130,0.3)] transition-all duration-200 hover:bg-rose-400 active:scale-95 touch-target"
          >
            再来一轮
          </button>
        </motion.div>
      ) : (
        /* ── 3D 翻转卡片 ──────────────────── */
        <div
          className="flex-1 flex items-center justify-center perspective-500 cursor-pointer select-none"
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleFlip();
            }
          }}
          aria-label={flipped ? "点击翻回正面" : "点击翻到背面"}
        >
          <div
            className="relative w-full h-44 transition-transform duration-600 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* 正面 */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-rose-50/60 rounded-2xl border border-rose-100/50 px-5 py-4"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-[11px] text-rose-300 tracking-[0.2em] uppercase">正面 · 问题</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`q-${idx}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="text-[15px] font-medium text-stone-600 tracking-wide text-center leading-relaxed whitespace-pre-line"
                >
                  {current.q}
                </motion.p>
              </AnimatePresence>
              <p className="text-[12px] text-stone-300 mt-1">👆 点击翻面</p>
            </div>

            {/* 背面 */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-rose-200/60 px-5 py-4"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-[11px] text-rose-300 tracking-[0.2em] uppercase">背面 · 答案</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`a-${idx}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="text-[14px] text-stone-600 tracking-wide text-center leading-relaxed space-y-1"
                >
                  {current.a.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* ── 底部操作栏 ──────────────── */}
      {!done && (
        <div className="flex items-center gap-2 mt-4">
          {/* 提示 */}
          <p className="flex-1 text-[11px] text-stone-300 tracking-wide">
            ← → 键切换 · 空格翻面
          </p>

          <button
            type="button"
            onClick={handleNext}
            disabled={transitioning}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] tracking-wide text-stone-400 hover:text-rose-500 hover:bg-rose-50/60 transition-all duration-200 disabled:opacity-40 active:scale-95 touch-target"
          >
            <span>👉 下一张</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   3. 情绪树洞（升级：打字动画 + AI 仗义回复）
   ═══════════════════════════════════════════════ */

const WISE_REPLIES: string[] = [
  "摸摸头，初二正是最皮的时候，别拿别人的错误惩罚咱们优雅的宋老师！",
  "老宋，这份坚持我替你记下了。等考上编制，让这届学生看看什么叫真正的好老师！",
  "深呼吸～实习期被气到是常事，但你今天还坚持备了课、刷了题，已经是超人了！",
  "老袁鉴定完毕：这不是你的问题，是这届青春期的正常现象。你做得很好，真的。",
  "来，跟着我说三遍：「这不是我的错。我做得很好。明天又是新的一天。」",
  "想想你喜欢的那些优秀语文老师，他们也曾站在你现在的讲台上手足无措。你正在变成他们。",
];

type TreeHolePhase = "idle" | "typing" | "response";

function EmotionTreeHole() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<TreeHolePhase>("idle");
  const [reply, setReply] = useState("");

  const handleSubmit = useCallback(() => {
    if (!text.trim() || phase !== "idle") return;

    setPhase("typing");

    // 2s 后随机弹出仗义回复
    setTimeout(() => {
      const pick = WISE_REPLIES[Math.floor(Math.random() * WISE_REPLIES.length)];
      setReply(pick);
      setPhase("response");
    }, 2000);
  }, [text, phase]);

  const handleReset = useCallback(() => {
    setText("");
    setReply("");
    setPhase("idle");
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🌲</span>
        <div>
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">情绪树洞</p>
          <p className="text-[13px] text-stone-500 tracking-wide mt-0.5">倾诉即治愈</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* ── 输入态 ──────────────────── */}
        {phase === "idle" && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="今天备考遇到了什么烦心事？写下来就好…"
              className="flex-1 w-full px-4 py-3.5 rounded-2xl resize-none bg-stone-50 border border-stone-200 text-[14px] text-stone-600 placeholder-stone-300 tracking-wide leading-relaxed transition-all duration-200 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleSubmit}
              className={`
                w-full py-3 rounded-2xl text-[14px] font-medium tracking-wide transition-all duration-300 touch-target
                ${text.trim()
                  ? "bg-rose-400/80 text-white shadow-[0_4px_16px_-6px_rgba(180,130,130,0.4)] hover:bg-rose-400 active:scale-[0.985]"
                  : "bg-stone-200/70 text-stone-400 cursor-not-allowed"
                }
              `}
            >
              发送给考前压力疏导 🌿
            </button>
          </>
        )}

        {/* ── 打字动画态 ──────────────── */}
        {phase === "typing" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 bg-rose-50/40 rounded-2xl px-4 py-6 text-center"
          >
            {/* 三个跳动圆点 */}
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                className="w-2.5 h-2.5 rounded-full bg-rose-300"
              />
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.15 }}
                className="w-2.5 h-2.5 rounded-full bg-rose-300"
              />
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
                className="w-2.5 h-2.5 rounded-full bg-rose-300"
              />
            </div>

            <p className="text-[13px] text-stone-400 tracking-wide">
              老袁的虚拟分身正在输入中...
            </p>
          </motion.div>
        )}

        {/* ── 回复态 ──────────────────── */}
        {phase === "response" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex-1 flex flex-col items-center gap-4 bg-rose-50/40 rounded-2xl px-5 py-5 text-center"
          >
            <span className="text-3xl">💌</span>
            <p className="text-[14px] text-stone-600 leading-relaxed tracking-wide">
              {reply}
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="mt-1 px-5 py-2.5 rounded-2xl bg-white border border-stone-200 text-[13px] text-stone-400 tracking-wide transition-all duration-200 hover:bg-stone-50 hover:text-stone-500 active:scale-95 touch-target"
            >
              再来倾诉一段
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   4. 助眠白噪音（保持不变）
   ═══════════════════════════════════════════════ */

const NOISE_OPTIONS = [
  { key: "rain", emoji: "🌧️", label: "雨声" },
  { key: "wind", emoji: "🍃", label: "微风" },
  { key: "fire", emoji: "🪵", label: "柴火" },
  { key: "wave", emoji: "🌊", label: "海浪" },
] as const;

function WhiteNoise() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🌧️</span>
        <div>
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">助眠白噪音</p>
          <p className="text-[13px] text-stone-500 tracking-wide mt-0.5">专注呼吸 · 静心凝神</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        {NOISE_OPTIONS.map((opt) => {
          const isActive = active === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setActive(isActive ? null : opt.key)}
              className={`
                flex flex-col items-center justify-center gap-2 py-5 rounded-2xl
                transition-all duration-300 touch-target
                ${isActive
                  ? "bg-rose-50/80 border-2 border-rose-200/60 text-rose-500 shadow-[0_2px_12px_-4px_rgba(180,130,130,0.15)]"
                  : "bg-stone-50 border-2 border-transparent text-stone-400 hover:bg-stone-100/80"
                }
              `}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-[12px] tracking-wide font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <p className="text-[12px] text-stone-300 text-center mt-4 tracking-wide">
          正在播放：{NOISE_OPTIONS.find((o) => o.key === active)?.label}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   组合导出
   ═══════════════════════════════════════════════ */

export default function EnergyModules() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <AudioPodcast />
      <Flashcard />
      <EmotionTreeHole />
      <WhiteNoise />
    </div>
  );
}
