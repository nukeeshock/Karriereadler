"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe localStorage hook.
 * Reads once on mount and writes whenever the value changes.
 * Swallows storage errors (private mode, adblockers, etc.).
 */
export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored != null) {
        try {
          setValue(JSON.parse(stored));
          return;
        } catch {
          // Fallback for legacy plain-string storage
          if (typeof defaultValue === "string") {
            setValue(stored as unknown as T);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}
