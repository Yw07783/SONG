"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CareModeContextValue {
  careMode: boolean;
  toggleCare: () => void;
}

const CareModeContext = createContext<CareModeContextValue | null>(null);

export function CareModeProvider({ children }: { children: ReactNode }) {
  const [careMode, setCareMode] = useState(false);

  const toggleCare = useCallback(() => setCareMode((v) => !v), []);

  return (
    <CareModeContext.Provider value={{ careMode, toggleCare }}>
      {children}
    </CareModeContext.Provider>
  );
}

export function useCareMode(): CareModeContextValue {
  const ctx = useContext(CareModeContext);
  if (!ctx) throw new Error("useCareMode must be used within CareModeProvider");
  return ctx;
}
