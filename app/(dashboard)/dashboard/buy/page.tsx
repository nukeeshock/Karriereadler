'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/db/schema';
import { Check, Sparkles, FileText, Package } from 'lucide-react';
import { WiderrufsCheckbox } from '@/components/checkout/widerrufs-checkbox';

type ProductKey = 'cv' | 'letter' | 'bundle';

const products: {
  key: ProductKey;
  title: string;
  description: string;
  priceLabel: string;
  price: number;
  cta: string;
  icon: typeof FileText;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    key: 'cv',
    title: 'Lebenslauf-Service',
    description: 'Dein Lebenslauf wird professionell von uns gefertigt',
    priceLabel: '20 €',
    price: 20,
    cta: 'Jetzt kaufen',
    icon: FileText,
    features: [
      '1x Lebenslauf',
      'Individuell auf deine Zielposition',
      'Korrekturen/Feinschliff inklusive',
      'Kein Abo, einmalig zahlen'
    ]
  },
  {
    key: 'letter',
    title: 'Anschreiben-Service',
    description: 'Zwei individuelle Anschreiben für unterschiedliche Stellen',
    priceLabel: '20 €',
    price: 20,
    cta: 'Jetzt kaufen',
    icon: Sparkles,
    features: [
      '2x individuelle Anschreiben',
      'Ton & Struktur nach Vorgabe',
      'Für verschiedene Stellenangebote',
      'Professionell formuliert von Experten'
    ]
  },
  {
    key: 'bundle',
    title: 'Komplett-Bundle',
    description: 'Lebenslauf-Service + zwei Anschreiben zum Vorteilspreis',
    priceLabel: '30 €',
    price: 30,
    cta: 'Jetzt Bundle kaufen',
    icon: Package,
    features: [
      '1x Lebenslauf',
      '2x individuelle Anschreiben',
      '10 € gespart gegenüber Einzelkauf',
      'Komplett-Paket für deine Bewerbung'
    ],
    highlight: true
  }
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BuyPage() {
  const [loadingProduct, setLoadingProduct] = useState<ProductKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [widerrufsAccepted, setWiderrufsAccepted] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);

  async function startCheckout(productType: ProductKey) {
    setLoadingProduct(productType);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productType })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || 'Zahlung ist derzeit nicht verfügbar. Bitte später erneut versuchen.'
        );
      }

      if (data.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error('Keine Checkout-URL erhalten.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoadingProduct(null);
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Wähle dein Paket
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Einmalige Zahlung, keine versteckten Kosten – sofort nach dem Kauf verfügbar
            </p>

            {/* Credits Display */}
            <div className="mt-8 inline-flex items-center gap-6 bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Lebenslauf-Credits</p>
                <p className="text-3xl font-bold text-orange-500">{user?.cvCredits ?? 0}</p>
              </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Anschreiben</p>
              <p className="text-3xl font-bold text-orange-500">{user?.letterCredits ?? 0}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Widerrufsrecht Notice */}
        <div className="max-w-4xl mx-auto mb-12">
          <WiderrufsCheckbox
            checked={widerrufsAccepted}
            onChange={setWiderrufsAccepted}
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <div
                key={product.key}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  product.highlight
                    ? 'border-orange-500 ring-4 ring-orange-100'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                {product.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
                      Beliebteste Wahl
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Title */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                        product.highlight
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                          : 'bg-orange-100'
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          product.highlight ? 'text-white' : 'text-orange-500'
                        }`}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">
                        {product.price}
                      </span>
                      <span className="text-2xl font-semibold text-gray-600">€</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">einmalig</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-orange-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => startCheckout(product.key)}
                    disabled={!widerrufsAccepted || loadingProduct !== null}
                    className={`w-full py-6 text-base font-semibold rounded-xl transition-all ${
                      product.highlight
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {loadingProduct === product.key ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Weiterleitung...
                      </span>
                    ) : (
                      product.cta
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nachbesserungs-Garantie */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Check className="h-6 w-6 text-green-600" />
              Zufriedenheitsgarantie durch Nachbesserung
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>
                Du erhältst keine 08/15-Vorlage, sondern <strong>individuell überarbeitete Unterlagen</strong>.
              </p>
              <p>
                Bist du mit Struktur, Layout oder Formulierungen nicht zufrieden, kannst du{' '}
                <strong>innerhalb von 14 Tagen nach Erhalt</strong> eine Überarbeitung anfordern –
                bis zu <strong>1 Überarbeitungsrunde ist inklusive</strong>.
              </p>
              <p className="text-sm text-gray-600 bg-white/60 rounded-lg p-3 border border-green-200">
                <strong>Hinweis:</strong> Ein Anspruch auf Rückerstattung besteht nicht, sofern wir die vereinbarte Leistung erbracht und Nachbesserungen angeboten haben. Dies entspricht der gesetzlichen Regelung für vollständig erbrachte digitale Dienstleistungen.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-xl shadow-sm border border-gray-200 px-8 py-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sichere Zahlung über Stripe
            </h3>
            <p className="text-sm text-gray-600">
              Nach dem Kauf erhältst du Credits, die du flexibel einsetzen kannst – kein Ablaufdatum, keine Abos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
