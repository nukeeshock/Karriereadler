'use client';

import { I18nProvider } from '@/components/providers/i18n-provider';
import { ConsentProvider } from '@/components/providers/consent-provider';
import { CookieBanner } from '@/components/cookie-banner';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ConsentProvider>
        {children}
        <CookieBanner />
      </ConsentProvider>
    </I18nProvider>
  );
}
