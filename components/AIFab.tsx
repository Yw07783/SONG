"use client";

import { useChat } from "@/contexts/ChatContext";

export default function AIFab() {
  const { open, toggle } = useChat();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "关闭 AI 导师" : "打开 AI 导师"}
      className={`
        fixed bottom-6 right-6 z-30
        flex items-center justify-center
        w-14 h-14 rounded-2xl
        text-white
        shadow-[0_6px_24px_-8px_rgba(180,120,120,0.45)]
        transition-all duration-400
        hover:shadow-[0_8px_30px_-6px_rgba(180,120,120,0.55)]
        active:scale-95
        touch-target
        ${open ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"}
      `}
      style={{
        background: "linear-gradient(135deg, #e8b8b8 0%, #d49a9a 50%, #c88080 100%)",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1H5a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z" />
        <circle cx="9" cy="16" r="1" fill="currentColor" />
        <circle cx="15" cy="16" r="1" fill="currentColor" />
        <path d="M8 20c0-1 2-2 4-2s4 1 4 2" />
      </svg>
    </button>
  );
}
