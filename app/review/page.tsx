"use client";

import dynamic from "next/dynamic";
import ReviewHeatmap from "@/components/ReviewHeatmap";
import ReviewCards from "@/components/ReviewCards";
import QuickPractice from "@/components/QuickPractice";
import SubjectWeightPanel from "@/components/SubjectWeightPanel";
import ErrorArchivePanel from "@/components/ErrorArchivePanel";

/* PDFExport 使用 framer-motion，必须禁止 SSR */
const PDFExport = dynamic(() => import("@/components/PDFExport"), {
  ssr: false,
});

export default function ReviewPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-8 pb-12 space-y-10">
          {/* ── 1. 热力图 + PDF 导出 ────────── */}
          <section>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <ReviewHeatmap />
              </div>
              <div className="shrink-0 pt-7">
                <PDFExport />
              </div>
            </div>
          </section>

          {/* ── 2. 双科权重分析 ────────────── */}
          <section>
            <SubjectWeightPanel />
          </section>

          {/* ── 3. 双模式切换面板 ────────────── */}
          <section>
            <ReviewCards />
          </section>

          {/* ── 4. 错题自动归档 ────────────── */}
          <section>
            <ErrorArchivePanel />
          </section>

          {/* ── 5. 主观题极简速练 ────────────── */}
          <section>
            <QuickPractice />
          </section>

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
