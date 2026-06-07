import { motion } from "framer-motion";

interface Props {
  lines?: number;
  className?: string;
}

export default function Skeleton({ lines = 3, className = "" }: Props) {
  return (
    <div className={`space-y-3 w-full ${className}`} role="status" aria-label="加载中">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.15 }}
          className="h-4 rounded-xl bg-stone-100"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

/* ── 卡片骨架 ──────────────────────────── */

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 p-6 space-y-4 ${className}`} role="status" aria-label="加载中">
      <Skeleton lines={1} />
      <Skeleton lines={2} />
    </div>
  );
}
