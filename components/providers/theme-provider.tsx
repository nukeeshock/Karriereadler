"use client";

import { createContext, useContext, useMemo, useState } from 'react';

export type ThemeMode = 'light';

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: 'light';
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: 'light',
      setTheme
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return ctx;
}

export function ThemeScript() {
  return null;
}

export function getThemeInitScript() {
  return '';
}
