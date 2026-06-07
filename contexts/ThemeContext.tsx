"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type ThemeId = "pink" | "apricot" | "mint" | "starry";

interface ThemeMeta {
  id: ThemeId;
  label: string;
  colors: string[]; // 3-sample swatch for UI
}

export const THEMES: ThemeMeta[] = [
  { id: "pink", label: "莫兰迪粉", colors: ["#fce4e4", "#e8b8b8", "#c88080"] },
  { id: "apricot", label: "奶茶杏", colors: ["#fff0e6", "#e8c8a8", "#c89870"] },
  { id: "mint", label: "薄荷绿", colors: ["#e6f5f0", "#a8d8c8", "#70b898"] },
  { id: "starry", label: "星空蓝", colors: ["#e8ecf6", "#a8b8d8", "#7088c0"] },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("pink");

  useEffect(() => {
    const saved = localStorage.getItem("jiaozhao_theme") as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    localStorage.setItem("jiaozhao_theme", id);
    document.documentElement.setAttribute("data-theme", id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
