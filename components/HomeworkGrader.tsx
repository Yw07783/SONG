"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── 类型 ─────────────────────────────────── */

type GradingPhase = "idle" | "capturing" | "captured" | "grading" | "done";

/* ── 安全检测 ───────────────────────────────── */

function canAccessCamera(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

/* ── 流式批改 API（多模态） ───────────────────── */

interface ContentPartText {
  type: "text";
  text: string;
}

interface ContentPartImage {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
}

async function* streamGrading(
  text: string,
  isComposition: boolean,
  imageBase64?: string | null,
): AsyncGenerator<string> {
  const modeLabel = isComposition ? "大作文" : "普通作业";

  /* 构建 System Prompt 前缀 */
  const gradingPrefix = isComposition
    ? `[批改模式：${modeLabel}]\n请严格按照4维度评分（立意20 + 结构20 + 语言20 + 核心素养20 = 满分80）批改以下作文。`
    : `[批改模式：${modeLabel}]\n请批改以下初中语文作业。选择题/填空题指出错因；阅读理解对比标准答案给出得分点分析；简答题点评要点覆盖率和表述精准度。`;

  const imageHint = imageBase64 ? "\n（附学生作业照片，请结合图片中的手写内容与下方文字进行多模态融合批改。）" : "";

  const fullPrompt = `${gradingPrefix}${imageHint}\n\n${text}`;

  /* 构建消息 content */
  const contentParts: (ContentPartText | ContentPartImage)[] = [
    { type: "text", text: fullPrompt },
  ];

  if (imageBase64) {
    contentParts.push({
      type: "image_url",
      image_url: { url: imageBase64, detail: "auto" },
    });
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "grading",
        messages: [{ role: "user", content: contentParts }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "批改失败" }));
      throw new Error(err.error ?? "批改失败");
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("无响应");

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "老袁正在维护中，请稍候再试。";
    yield msg;
  }
}

/* ── 打字机效果文本 ────────────────────────── */

const TYPING_PHRASES = [
  "老袁正在连夜批改作业...",
  "正在逐字审阅答题要点...",
  "对比新课标评分标准中...",
  "分析学生常见错误模式...",
  "生成个性化批注建议...",
  "马上就好，老宋稍等...",
];

/* ── 组件 ─────────────────────────────────── */

export default function HomeworkGrader() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [phase, setPhase] = useState<GradingPhase>("idle");
  const [typingIndex, setTypingIndex] = useState(0);
  const [isComposition, setIsComposition] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* 摄像头 */
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── 打开摄像头（SSR 安全） ───── */
  const openCamera = useCallback(async () => {
    setCameraError("");
    if (!canAccessCamera()) {
      setCameraError("当前环境不支持摄像头（需 HTTPS 或 localhost）。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOpen(true);
      setPhase("capturing");
    } catch {
      setCameraError("无法访问摄像头。请检查浏览器权限设置。");
    }
  }, []);

  /* ── 关闭摄像头 ──────────────── */
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    if (phase === "capturing") setPhase("idle");
  }, [phase]);

  /* ── 拍照 ───────────────────── */
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    setPhase("captured");
    closeCamera();
  }, [closeCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    openCamera();
  }, [openCamera]);

  /* ── 打字机动效 ──────────────── */
  useEffect(() => {
    if (phase !== "grading") return;
    const timer = setInterval(() => {
      setTypingIndex((i) => (i + 1) % TYPING_PHRASES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [phase]);

  /* ── 结果自动滚动 ────────────── */
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  /* ── 组件卸载时清理摄像头 ────── */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ── 提交批改（多模态） ───────── */
  const handleSubmit = useCallback(async () => {
    if (!text.trim() || phase === "grading") return;
    setPhase("grading");
    setResult("");
    setTypingIndex(0);

    try {
      for await (const chunk of streamGrading(text.trim(), isComposition, capturedImage)) {
        setResult((prev) => prev + chunk);
      }
    } catch {
      setResult("老袁正在维护中，请稍候再试。");
    }
    setPhase("done");
  }, [text, isComposition, phase, capturedImage]);

  const handleReset = useCallback(() => {
    setText("");
    setResult("");
    setCapturedImage(null);
    setPhase("idle");
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* ═══ 左侧：作业导入区 ═══ */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 mb-4">
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">作业输入</p>
          <h3 className="text-[15px] font-medium text-stone-700 tracking-wide mt-1">
            拍照或粘贴学生作答内容
          </h3>
        </div>

        {/* ── 摄像头预览 ─────────── */}
        <AnimatePresence>
          {cameraOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-2xl mb-4"
            >
              <div className="relative bg-stone-900 rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-900/60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-4">
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors touch-target"
                    aria-label="关闭摄像头"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full border-4 border-white/80 flex items-center justify-center hover:scale-105 active:scale-95 transition-all touch-target"
                    aria-label="拍照"
                  >
                    <div className="w-12 h-12 rounded-full bg-white" />
                  </button>
                </div>
                <p className="absolute top-4 left-1/2 -translate-x-1/2 text-[12px] text-white/70 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm tracking-wide">
                  将作业置于框内拍照
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <canvas ref={canvasRef} className="hidden" />

        {/* ── 拍照结果预览 ─────────── */}
        <AnimatePresence>
          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="shrink-0 mb-4 rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="作业照片" className="w-full max-h-[200px] object-contain" />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm text-[11px] text-stone-500 shadow-sm hover:bg-white transition-colors touch-target"
                >
                  重拍
                </button>
                <button
                  type="button"
                  onClick={() => { setCapturedImage(null); setPhase("idle"); }}
                  className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm text-[11px] text-rose-400 shadow-sm hover:bg-white transition-colors touch-target"
                >
                  移除
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-rose-500/90 text-white text-[10px] px-2.5 py-1 rounded-full tracking-wide backdrop-blur-sm">
                📷 已拍摄 — 请在下方输入框中补录题目文字
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 拍照按钮 ─────────────── */}
        {!cameraOpen && !capturedImage && (
          <motion.button
            type="button"
            onClick={openCamera}
            disabled={phase === "grading"}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 mb-4 w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all duration-300 touch-target disabled:opacity-40 group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 group-hover:bg-rose-100/50 flex items-center justify-center transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[13px] font-medium tracking-wide">点击拍照上传作业</p>
              <p className="text-[11px] text-stone-300 tracking-wide">支持调用摄像头直接拍摄学生作业本</p>
            </div>
          </motion.button>
        )}

        {cameraError && (
          <p className="text-[12px] text-rose-400 mb-4 px-2 tracking-wide">{cameraError}</p>
        )}

        {/* ── 文本输入 ─────────────── */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={`示例：\n\n阅读《背影》选段，回答：文中"我那时真是聪明过分"运用了什么修辞手法？表达了作者怎样的情感？\n\n学生答案：运用了反语的修辞手法，表达了作者对自己当年不理解父亲深沉父爱的愧疚与自责。`}
          disabled={phase === "grading"}
          className="flex-1 min-h-[160px] w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 text-[14px] text-stone-600 placeholder-stone-300 tracking-wide leading-relaxed resize-none focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all duration-200 disabled:opacity-50"
        />

        {/* ── 操作栏 ───────────────── */}
        <div className="shrink-0 flex items-center justify-between mt-4 gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setIsComposition((v) => !v)}
            className={`px-3 py-2 rounded-xl text-[12px] tracking-wide transition-all duration-200 touch-target ${
              isComposition
                ? "bg-rose-100/70 text-rose-600 border border-rose-200/60"
                : "bg-stone-50 text-stone-400 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            {isComposition ? "📝 作文模式" : "📄 普通批改"}
          </button>

          <div className="flex gap-2">
            {phase === "done" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-2xl text-[13px] text-stone-400 bg-stone-50 border border-stone-200 tracking-wide transition-all duration-200 hover:bg-stone-100 active:scale-[0.97] touch-target"
              >
                重新批改
              </motion.button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || phase === "grading"}
              className="px-6 py-2.5 rounded-2xl text-[13px] font-medium tracking-wide text-white transition-all duration-200 active:scale-[0.97] touch-target disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
                boxShadow: "0 4px 16px -6px rgba(180,120,120,0.4)",
              }}
            >
              {phase === "grading" ? "批改中..." : "✨ 提交批改"}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 右侧：AI 批改结果 ═══ */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 mb-4">
          <p className="text-[11px] tracking-[0.2em] text-stone-300 uppercase">批改结果</p>
          <h3 className="text-[15px] font-medium text-stone-700 tracking-wide mt-1">
            {phase === "idle" || phase === "capturing" || phase === "captured"
              ? "等待提交"
              : phase === "grading"
              ? "批改进行中"
              : "批改完成"}
          </h3>
        </div>

        <div
          ref={resultRef}
          className="flex-1 min-h-[200px] overflow-y-auto hide-scrollbar rounded-2xl bg-white border border-stone-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] p-5"
        >
          <AnimatePresence mode="wait">
            {(phase === "idle" || phase === "capturing" || phase === "captured") && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center gap-3"
              >
                <span className="text-3xl opacity-30">📋</span>
                <p className="text-[13px] text-stone-300 tracking-wide leading-relaxed max-w-[240px]">
                  {capturedImage
                    ? "照片已就绪，请在左侧输入框中补充题目文字后提交批改。"
                    : "拍照或粘贴作业内容后，点击「提交批改」，老袁将为您逐题分析。"}
                </p>
                {capturedImage && (
                  <p className="text-[11px] text-rose-300 tracking-wide">📷 照片已附加，AI 将结合图片内容批改</p>
                )}
              </motion.div>
            )}

            {phase === "grading" && (
              <motion.div
                key="grading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #e8b8b8, #c88080)" }}
                  >
                    <span className="text-2xl">✍️</span>
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={typingIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="text-[13px] text-stone-400 tracking-wide text-center"
                  >
                    {TYPING_PHRASES[typingIndex]}
                  </motion.p>
                </AnimatePresence>

                <div className="flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: d }}
                      className="w-2 h-2 rounded-full bg-rose-300"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[14px] text-stone-600 leading-relaxed tracking-wide whitespace-pre-wrap"
              >
                {result || "无批改结果"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
