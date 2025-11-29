'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { User } from '@/lib/db/schema';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Unbekannter Fehler');
  }

  return data;
};

const productCopy: Record<string, { title: string; detail: string }> = {
  cv: {
    title: 'Lebenslauf-Credit freigeschaltet',
    detail: 'Du kannst sofort mit der Erstellung starten.'
  },
  letter: {
    title: 'Anschreiben-Credits freigeschaltet',
    detail: 'Zwei individuelle Anschreiben stehen bereit.'
  },
  bundle: {
    title: 'Bundle freigeschaltet',
    detail: '1x Lebenslauf und 2x Anschreiben sind aktiviert.'
  }
};

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const {
    data: finalize,
    error: finalizeError,
    isValidating: isFinalizing,
    mutate: refetchFinalize
  } = useSWR(
    sessionId ? `/api/checkout/finalize?session_id=${sessionId}` : null,
    fetcher,
    { shouldRetryOnError: false }
  );

  const { data: user, mutate: refetchUser } = useSWR<User>('/api/user', fetcher);
  const { mutate: refetchPurchases } = useSWR('/api/purchases', fetcher);

  useEffect(() => {
    if (finalize?.ok) {
      refetchUser();
      refetchPurchases();
    }
  }, [finalize?.ok, refetchPurchases, refetchUser]);

  const status: 'pending' | 'success' | 'error' | 'missing' = sessionId
    ? finalizeError
      ? 'error'
      : finalize?.ok
      ? 'success'
      : 'pending'
    : 'missing';

  const copy =
    (finalize?.productType && productCopy[finalize.productType]) || productCopy.cv;

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white border border-orange-100 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 p-8 sm:p-10 text-white">
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div>
                <p className="uppercase tracking-[0.2em] text-xs font-semibold text-orange-100">
                  Zahlung erfolgreich
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
                  Danke für deinen Kauf!
                </h1>
                <p className="text-orange-100 mt-2">
                  Wir bestätigen die Zahlung und schalten deine Credits frei.
                </p>
              </div>
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white/90" />
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            {status === 'pending' && (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 text-orange-800">
                <Loader2 className="w-5 h-5 animate-spin" />
                <div>
                  <p className="font-semibold">Wir bestätigen deine Zahlung.</p>
                  <p className="text-sm text-orange-700">
                    Bitte warte einen Moment, deine Credits werden in wenigen Sekunden verbucht.
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-green-800">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <p className="font-semibold">{copy.title}</p>
                  <p className="text-sm text-green-700">{copy.detail}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-red-800">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Wir konnten die Zahlung nicht bestätigen.</p>
                  <p className="text-sm text-red-700">
                    {finalizeError instanceof Error
                      ? finalizeError.message
                      : 'Bitte versuche es erneut oder kontaktiere den Support.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => refetchFinalize()}
                    disabled={isFinalizing}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Erneut prüfen
                  </Button>
                </div>
              </div>
            )}

            {status === 'missing' && (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Kein Checkout-Code gefunden.</p>
                  <p className="text-sm text-yellow-700">
                    Der Link scheint unvollständig zu sein. Bitte kehre zur Kaufübersicht zurück.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-orange-600 to-orange-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-white/10 rounded-full" />
                <div className="relative">
                  <p className="text-orange-100 text-sm mb-1">Deine nächsten Schritte</p>
                  <h2 className="text-2xl font-bold mb-3">Nutze deine neuen Credits</h2>
                  <p className="text-orange-50 mb-4 max-w-2xl">
                    Starte direkt mit deinem Lebenslauf oder erstelle ein Anschreiben. Du kannst jederzeit zurückkehren, deine Credits verfallen nicht.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      asChild
                      className="bg-white text-orange-600 hover:bg-orange-50"
                      disabled={status === 'pending'}
                    >
                      <Link href="/cv/new">
                        Lebenslauf beginnen
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/60 text-white hover:bg-white/10"
                      disabled={status === 'pending'}
                    >
                      <Link href="/cover-letter/new">
                        Anschreiben erstellen
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Aktueller Stand</p>
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Lebenslauf-Credits
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {user?.cvCredits ?? 0}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Anschreiben-Credits
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {user?.letterCredits ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border border-gray-200 rounded-2xl p-5">
              <div>
                <p className="font-semibold text-gray-900">Zurück zur Übersicht</p>
                <p className="text-sm text-gray-600">
                  Sieh dir deine Kaufhistorie und genutzten Credits im Dashboard an.
                </p>
              </div>
              <Button asChild variant="outline" className="border-orange-200 text-orange-700">
                <Link href="/dashboard">
                  Zum Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
