"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeId = "bn-claro" | "bn-calido" | "bn-oscuro";

export const THEMES: { id: ThemeId; label: string; icon: string }[] = [
  { id: "bn-claro", label: "B/N Claro", icon: "🌕" },
  { id: "bn-calido", label: "B/N Cálido", icon: "🍂" },
  { id: "bn-oscuro", label: "B/N Oscuro", icon: "🌑" },
];

interface ThemeCtx {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = "sipes.mock.theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("bn-claro");

  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.theme) {
      let stored: ThemeId | null = null;
      try {
        stored = window.localStorage.getItem(KEY) as ThemeId | null;
      } catch {
        /* ignore */
      }
      if (stored && THEMES.some((t) => t.id === stored)) {
        root.dataset.theme = stored;
        setThemeState(stored);
      } else {
        root.dataset.theme = "bn-claro";
      }
    } else {
      setThemeState(root.dataset.theme as ThemeId);
    }
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme: (t) => {
        setThemeState(t);
        try {
          window.localStorage.setItem(KEY, t);
        } catch {
          /* ignore */
        }
        document.documentElement.dataset.theme = t;
      },
    }),
    [theme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
