"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { PAGE_TRANSITION, FADE_UP, FADE_DOWN } from "@/lib/spring";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={FADE_UP}
        animate={{ opacity: 1, y: 0 }}
        exit={FADE_DOWN}
        transition={PAGE_TRANSITION}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
