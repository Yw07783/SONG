"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFluxImmersive } from "@/contexts/FluxImmersiveContext";

export default function NavTriggerLine() {
  const { immersive, disable } = useFluxImmersive();
  const [hovering, setHovering] = useState(false);

  return (
    <AnimatePresence>
      {immersive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-0 top-0 z-40 h-full w-3 cursor-pointer"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={disable}
        >
          {/* 极细导航线 */}
          <div
            className={`
              h-full w-0.5 mx-auto transition-all duration-400
              ${hovering ? "bg-rose-300/60 scale-x-[4]" : "bg-rose-200/20"}
            `}
          />

          {/* hover 提示 */}
          <AnimatePresence>
            {hovering && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-white border border-stone-100 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.08)] text-[11px] text-stone-400 tracking-wide whitespace-nowrap pointer-events-none"
              >
                点击退出心流模式
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
