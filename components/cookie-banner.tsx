'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/components/providers/consent-provider';
import { useI18n } from '@/components/providers/i18n-provider';

export function CookieBanner() {
  const { consent, hasChoice, setConsent } = useConsent();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisible(!hasChoice);
  }, [hasChoice]);

  // Don't render on server
  if (!mounted) return null;
  if (!visible) return null;

  const handleEssentialOnly = () => {
    console.log('Essential only clicked');
    setConsent({ essential: true, analytics: false });
    setVisible(false);
  };

  const handleAcceptAll = () => {
    console.log('Accept all clicked');
    setConsent({ essential: true, analytics: true });
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-[9999] rounded-xl border border-orange-200 bg-white/95 dark:bg-gray-900 dark:border-gray-700 shadow-lg p-4 sm:p-5 max-w-3xl mx-auto pointer-events-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{t('cookie.title')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t('cookie.description')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleEssentialOnly}
            type="button"
          >
            {t('cookie.essentialOnly')}
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleAcceptAll}
            type="button"
          >
            {t('cookie.acceptAll')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  const { resetConsent } = useConsent();
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-600 underline"
      onClick={() => resetConsent()}
    >
      {t('cookie.manage')}
    </button>
  );
}
