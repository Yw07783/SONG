"use client";

import dynamic from "next/dynamic";

/* ExamDashboard 及其子组件使用 framer-motion，必须禁止 SSR */
const ExamDashboard = dynamic(() => import("@/components/ExamDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-200 animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0.1s" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  ),
});

export default function QuestionBankPage() {
  return <ExamDashboard />;
}
