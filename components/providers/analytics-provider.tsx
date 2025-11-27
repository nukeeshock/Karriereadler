'use client';

import { useConsent } from './consent-provider';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createAnalytics } from '@/lib/analytics/client';

export function AnalyticsProvider({ children }: { children?: React.ReactNode }) {
  const { consent, hasChoice } = useConsent();
  const pathname = usePathname();
  const trackerRef = useRef<ReturnType<typeof createAnalytics> | null>(null);
  const [mounted, setMounted] = useState(false);

  // Only mount after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-init when consent changes
  useEffect(() => {
    if (!mounted) return;
    // Only enable analytics if user has made a choice AND consented
    const shouldEnable = hasChoice && consent.analytics;
    trackerRef.current = createAnalytics({ enabled: shouldEnable });
  }, [consent.analytics, hasChoice, mounted]);

  // Track page changes (only if analytics enabled)
  useEffect(() => {
    if (!mounted || !hasChoice || !consent.analytics) return;
    if (!trackerRef.current || !pathname) return;

    trackerRef.current.trackPageView(pathname);
    return () => {
      trackerRef.current?.stopTimer();
    };
  }, [pathname, consent.analytics, hasChoice, mounted]);

  // Cleanup on unmount
  useEffect(() => {
    if (!mounted) return;

    const handleUnload = () => {
      trackerRef.current?.stopTimer();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [mounted]);

  return <>{children}</>;
}
