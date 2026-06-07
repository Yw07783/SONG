"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";

/* ── 类型 ─────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

/* ── 欢迎语 ───────────────────────────────── */

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "你好呀！今天复习遇到什么不懂的题了吗？你可以随时把题目发给我，我来帮你解答！",
  time: nowTime(),
};

function nowTime(): string {
  return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

/* ── 快捷提问 ──────────────────────────────── */

const QUICK_PROMPTS = [
  "这道题不太理解，帮我分析一下",
  "帮我梳理一下文言文实词",
  "教学设计怎么写才能拿高分",
  "给我一些新课标简答题模板",
];

/* ── 流式 API 调用 ──────────────────────────── */

async function* streamChat(
  history: { role: "user" | "assistant"; content: string }[],
  district?: string,
): AsyncGenerator<string> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, district }),
    });
  } catch {
    throw new Error("老袁正在维护中，请稍候再试。");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "服务暂时不可用" }));
    throw new Error(err.error ?? "老袁正在维护中，请稍候再试。");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("老袁正在维护中，请稍候再试。");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

/* ── 组件 ─────────────────────────────────── */

export default function AIChatDrawer() {
  const { open, close } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── 打开/关闭逻辑 ──────────────────── */
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      setMessages([WELCOME_MSG]);
      setInput("");
      setThinking(false);
    }
  }, [open]);

  /* ── ESC 关闭 ─────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  /* ── 发送消息 + 流式接收 ──────────────── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      time: nowTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    /* 构建对话历史 */
    const history: { role: "user" | "assistant"; content: string }[] = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.text }));

    history.push({ role: "user", content: text });

    /* 从 localStorage 读取最后选中的考区 */
    const district =
      typeof window !== "undefined"
        ? localStorage.getItem("jiaozhao_selected_district") ?? undefined
        : undefined;

    /* 预留 AI 消息占位 */
    const aiId = `a-${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiId,
      role: "assistant",
      text: "",
      time: nowTime(),
    };

    setMessages((prev) => [...prev, aiMsg]);

    try {
      /* 流式累积 */
      for await (const chunk of streamChat(history, district)) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, text: m.text + chunk } : m,
          ),
        );
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "未知错误";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, text: m.text || `老袁正在维护中，请稍候再试。` }
            : m,
        ),
      );
    }

    setThinking(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [input, thinking, messages]);

  /* ── 键盘发送 ─────────────────────────── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  /* ── 快捷提问 ──────────────────────────── */
  const handleQuickPrompt = useCallback((prompt: string) => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  /* ── 渲染 ──────────────────────────────── */

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-stone-900/12 backdrop-blur-[1px]"
          />

          {/* 抽屉 */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="AI 专属导师"
            initial={{ x: "100%" }}
            animate={{ x: 0, transition: { type: "spring", stiffness: 280, damping: 30 } }}
            exit={{ x: "100%", transition: { type: "spring", stiffness: 300, damping: 28 } }}
            className="fixed top-0 right-0 z-50 h-full w-[min(420px,88vw)] bg-white/98 backdrop-blur-xl border-l border-stone-100 shadow-[-8px_0_40px_-16px_rgba(140,100,100,0.1)] flex flex-col"
          >
            {/* ── 头部 ──────────────────── */}
            <div className="shrink-0 flex items-center justify-between px-6 pt-7 pb-5 border-b border-stone-100/80">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #e8b8b8, #d49a9a, #c88080)" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1H5a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z" />
                    <circle cx="9" cy="16" r="1" fill="white" />
                    <circle cx="15" cy="16" r="1" fill="white" />
                    <path d="M8 20c0-1 2-2 4-2s4 1 4 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[15px] font-medium tracking-wide text-stone-700">老袁 · AI 导师</h2>
                  <p className="text-[11px] text-stone-300 tracking-wide">
                    {thinking ? "正在输入…" : "DeepSeek · 在线 · 随时解答"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-stone-300 hover:text-stone-500 hover:bg-stone-50 transition-colors duration-200 touch-target"
                aria-label="关闭聊天"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ── 消息列表 ───────────────── */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-5 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed tracking-wide whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-rose-100/50 text-stone-700 rounded-br-md"
                        : "bg-stone-50 text-stone-600 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-[10px] text-stone-300 mt-1.5 text-right">{msg.time}</p>
                  </div>
                </motion.div>
              ))}

              {/* 加载态：跳动圆点 */}
              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-stone-50 rounded-2xl rounded-bl-md px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-rose-300"
                      />
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.15 }}
                        className="w-2 h-2 rounded-full bg-rose-300"
                      />
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
                        className="w-2 h-2 rounded-full bg-rose-300"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── 快捷提问 ────────────────── */}
            {messages.length <= 1 && !thinking && (
              <div className="shrink-0 px-5 pb-3">
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleQuickPrompt(p)}
                      className="px-3 py-2 rounded-xl bg-rose-50/60 border border-rose-100/40 text-[12px] text-stone-500 tracking-wide transition-all duration-200 hover:bg-rose-100/50 hover:text-rose-600 active:scale-[0.97]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 输入区 ──────────────────── */}
            <div className="shrink-0 px-5 pb-5 pt-3 border-t border-stone-100/80 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={thinking}
                  placeholder={thinking ? "老袁正在打字…" : "输入你的问题…"}
                  className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-[14px] text-stone-600 placeholder-stone-300 tracking-wide transition-all duration-200 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || thinking}
                  className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 touch-target ${
                    input.trim() && !thinking
                      ? "text-white shadow-[0_4px_12px_-4px_rgba(180,130,130,0.4)] hover:shadow-[0_6px_16px_-4px_rgba(180,130,130,0.5)] active:scale-95"
                      : "text-stone-300 bg-stone-100 cursor-not-allowed"
                  }`}
                  style={
                    input.trim() && !thinking
                      ? { background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)" }
                      : undefined
                  }
                  aria-label="发送消息"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>

              {/* 能力标注 */}
              <p className="text-[10px] text-stone-300 text-center mt-2 tracking-wide opacity-40">
                由 DeepSeek 驱动 · 老袁专业陪练
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
