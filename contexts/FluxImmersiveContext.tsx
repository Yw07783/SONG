"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ContextValue {
  immersive: boolean;
  enable: () => void;
  disable: () => void;
}

const FluxContext = createContext<ContextValue | null>(null);

export function FluxImmersiveProvider({ children }: { children: ReactNode }) {
  const [immersive, setImmersive] = useState(false);
  const enable = useCallback(() => setImmersive(true), []);
  const disable = useCallback(() => setImmersive(false), []);

  return (
    <FluxContext.Provider value={{ immersive, enable, disable }}>
      {children}
    </FluxContext.Provider>
  );
}

export function useFluxImmersive(): ContextValue {
  const ctx = useContext(FluxContext);
  if (!ctx) throw new Error("useFluxImmersive must be used within FluxImmersiveProvider");
  return ctx;
}
