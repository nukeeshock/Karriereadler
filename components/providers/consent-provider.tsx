'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';

export type ConsentState = {
  essential: boolean;
  analytics: boolean;
};

type ConsentContextValue = {
  consent: ConsentState;
  hasChoice: boolean;
  setConsent: (state: ConsentState) => void;
  resetConsent: () => void;
};

const STORAGE_KEY = 'ka-consent';

const ConsentContext = createContext<ConsentContextValue | null>(null);

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${value};path=/;max-age=${maxAgeSeconds};SameSite=Lax`;
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = usePersistentState<ConsentState>(STORAGE_KEY, {
    essential: true,
    analytics: false
  });
  const [hasChoice, setHasChoice] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const raw = getCookie(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.analytics === 'boolean') {
        setConsentState({ essential: true, analytics: parsed.analytics });
        setHasChoice(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: ConsentState) => {
    const value = JSON.stringify(next);
    setConsentState(next);
    setCookie(STORAGE_KEY, value);
    setHasChoice(true);
  };

  const resetConsent = () => {
    setConsentState({ essential: true, analytics: false });
    setCookie(STORAGE_KEY, '', 0);
    setHasChoice(false);
  };

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasChoice,
      setConsent: persist,
      resetConsent
    }),
    [consent, hasChoice]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
