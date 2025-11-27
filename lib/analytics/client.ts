"use client";

type InitOptions = {
  enabled: boolean;
};

export function createAnalytics(_options: InitOptions) {
  // Analytics disabled / safely no-op to avoid client errors (adblock/offline/SSR)
  return {
    trackPageView: (_page: string) => {},
    startTimer: (_page: string) => {},
    stopTimer: () => {}
  };
}
