"use client";

import { useState, useEffect, type ReactNode } from "react";

/**
 * Safe SSR wrapper — only renders children on the client.
 * Use this for components that access browser-only APIs (localStorage, window, etc.)
 * but can't be easily dynamically imported.
 */
export default function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;
  return <>{children}</>;
}
