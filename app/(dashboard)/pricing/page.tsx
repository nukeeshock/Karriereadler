import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Check, Star, Clock, RefreshCw, FileText, Globe, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lebenslauf & Anschreiben Preise – Professionelle Erstellung ab 20 €',
  description:
    'Preise für Lebenslauf, Anschreiben und Bundle: ab 20 €, manuell erstellt, 2–3 Werktage Lieferzeit, Korrekturschleife inklusive.',
  alternates: {
    canonical: '/pricing'
  }
};

const products = [
  {
    name: 'Lebenslauf-Service',
    priceEuro: 20,
    description: 'Professionell erstellter Lebenslauf ab 20 €.',
    features: ['1x Lebenslauf', 'Individuell erstellt von Experten', 'Word (.docx) + PDF', 'Lieferzeit: 2–3 Werktage', '1x Korrekturschleife inklusive', 'Deutsch oder Englisch'],
    productType: 'cv',
    recommended: false
  },
  {
    name: 'Anschreiben-Service',
    priceEuro: 20,
    description: 'Individuell formuliertes Anschreiben ab 20 €.',
    features: ['1x Anschreiben', 'Ton & Struktur nach Vorgabe', 'Word (.docx) + PDF', 'Lieferzeit: 2–3 Werktage', '1x Korrekturschleife inklusive', 'Deutsch oder Englisch'],
    productType: 'cover',
    recommended: false
  },
  {
    name: 'Bundle: Lebenslauf + Anschreiben',
    priceEuro: 30,
    description: 'Lebenslauf-Service und Anschreiben zusammen zum Vorteilspreis.',
    features: ['1x Lebenslauf', '1x Anschreiben', '10 € gespart gegenüber Einzelkauf', 'Word (.docx) + PDF', 'Lieferzeit: 2–3 Werktage', '1x Korrekturschleife inklusive', 'Deutsch oder Englisch'],
    productType: 'bundle',
    recommended: true
  }
] as const;

const baseUrl = process.env.BASE_URL ?? 'https://karriereadler.com';
const aggregateRating = {
  ratingValue: '4.8',
  reviewCount: '200'
};

export default function PricingPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Script id="pricing-product-jsonld" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': products.map((product) => ({
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: `${baseUrl}/logo_adler_notagline.png`,
            brand: {
              '@type': 'Brand',
              name: 'Karriereadler'
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              price: product.priceEuro.toFixed(2),
              availability: 'https://schema.org/InStock',
              url: `${baseUrl}/kaufen?product=${product.productType}`
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: aggregateRating.ratingValue,
              reviewCount: aggregateRating.reviewCount
            }
          }))
        })}
      </Script>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Preise ohne Abo</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Zahle nur einmal – professionelle Bewerbungsunterlagen, individuell für dich erstellt.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600">
          <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
          <span>4.8/5 Bewertung · 200+ zufriedene Kunden</span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {products.map((product) => (
          <PricingCard key={product.productType} product={product} />
        ))}
      </div>

      {/* What's Included Section */}
      <section className="bg-gray-50 rounded-xl p-8 border border-gray-100 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Bei jedem Paket inklusive</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Editierbare Dateien</h3>
            <p className="text-sm text-gray-600">Word (.docx) + PDF – du kannst alles selbst anpassen</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Schnelle Lieferung</h3>
            <p className="text-sm text-gray-600">2–3 Werktage Bearbeitungszeit – damit du keine Zeit verlierst</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <RefreshCw className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">1x Korrekturschleife</h3>
            <p className="text-sm text-gray-600">Wir passen Details an, bis du zufrieden bist</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <Globe className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Deutsch oder Englisch</h3>
            <p className="text-sm text-gray-600">Je nach Zielmarkt – du entscheidest</p>
          </div>
        </div>
      </section>

      {/* Zufriedenheitsgarantie */}
      <section className="max-w-3xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Zufriedenheitsgarantie durch Nachbesserung
          </h3>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>
              Du erhältst individuell erstellte Unterlagen – keine Standardvorlage.
            </p>
            <p>
              Nicht zufrieden? Innerhalb von 14 Tagen kannst du Änderungen anfordern –
              eine Korrekturschleife ist inklusive.
            </p>
            <p className="text-sm text-gray-500 bg-white/60 rounded p-2 border border-green-100 mt-3">
              <strong>Hinweis:</strong> Eine Rückerstattung ist nicht möglich, wenn wir die Leistung erbracht und Nachbesserungen angeboten haben.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function PricingCard({
  product
}: {
  product: (typeof products)[number];
}) {
  const isRecommended = product.recommended;
  const detailLink =
    product.productType === 'cv'
      ? '/lebenslauf-schreiben-lassen'
      : product.productType === 'cover'
        ? '/anschreiben-schreiben-lassen'
        : '/pricing';
  const detailLabel =
    product.productType === 'cv'
      ? 'Details zum Lebenslauf-Service'
      : product.productType === 'cover'
        ? 'Details zum Anschreiben-Service'
        : 'Bundle-Leistungen ansehen';

  return (
    <article className={`flex flex-col p-6 bg-white rounded-lg border-2 relative ${isRecommended ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200'
      }`}>
      {isRecommended && (
        <div className="absolute -top-3 left-4">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Empfohlen
          </span>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-1 mt-1">
        {product.name}
      </h2>
      <p className="text-sm text-gray-600 mb-4">{product.description}</p>

      <p className="text-3xl font-bold text-gray-900 mb-6">
        {product.priceEuro} €
        <span className="text-base font-normal text-gray-500 ml-1">einmalig</span>
      </p>

      <ul className="space-y-3 mb-6 flex-grow">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3 mt-auto">
        <Link
          href={`/kaufen?product=${product.productType}`}
          className={`block w-full text-center py-3 px-4 font-semibold rounded-lg transition-colors duration-200 ${isRecommended
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
        >
          Jetzt kaufen
        </Link>

        {product.productType !== 'bundle' && (
          <Link
            href={detailLink}
            className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            {detailLabel} →
          </Link>
        )}
      </div>
    </article>
  );
}
