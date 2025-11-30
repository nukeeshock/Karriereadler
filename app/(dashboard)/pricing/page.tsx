import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { Check, Star, Clock, RefreshCw, FileText, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Lebenslauf & Anschreiben Preise – Professionelle Erstellung ab 20 €',
  description:
    'Preise für Lebenslauf, Anschreiben und Bundle: ab 20 €, manuell erstellt, 2–3 Werktage Lieferzeit, Korrekturschleife inklusive.',
  alternates: {
    canonical: '/pricing'
  }
};

const products = [
  {
    name: 'Lebenslauf-Service',
    priceEuro: 20,
    description: 'Dein Lebenslauf wird professionell von uns gefertigt.',
    features: ['1x Lebenslauf', 'Individuell erstellt von Experten', 'Word (.docx) + PDF', 'Lieferzeit: 2-3 Werktage', '1x Korrekturschleife inklusive', 'Deutsch oder Englisch'],
    productType: 'cv',
    recommended: false
  },
  {
    name: 'Anschreiben-Service',
    priceEuro: 20,
    description: 'Ein individuelles Anschreiben für deine Zielposition.',
    features: ['1x Anschreiben', 'Ton & Struktur nach Vorgabe', 'Word (.docx) + PDF', 'Lieferzeit: 2-3 Werktage', '1x Korrekturschleife inklusive', 'Deutsch oder Englisch'],
    productType: 'cover',
    recommended: false
  },
  {
    name: 'Bundle: Lebenslauf + Anschreiben',
    priceEuro: 30,
    description: 'Lebenslauf-Service und Anschreiben zusammen zum Vorteilspreis.',
    features: ['1x Lebenslauf', '1x Anschreiben', '10 € gespart gegenüber Einzelkauf', 'Word (.docx) + PDF', 'Lieferzeit: 2-3 Werktage', '1x Korrekturschleife inklusive', 'Deutsch oder Englisch'],
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
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Preise ohne Abo</h1>
        <p className="text-gray-600 mt-2">Zahle nur einmal – professionelle Bewerbungsunterlagen, individuell für dich erstellt.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-200 transition-colors duration-300">
          <Star className="h-4 w-4 fill-orange-600 text-orange-600" />
          <span>4.8/5 Bewertung · 200+ zufriedene Kunden</span>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {products.map((product) => (
          <PricingCard key={product.productType} product={product} />
        ))}
      </div>

      {/* What's Included Section */}
      <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 sm:p-12 border border-orange-100 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bei jedem Paket inklusive</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 group-hover:rotate-12 transition-all duration-300">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Editierbare Dateien</h3>
            <p className="text-sm text-gray-600">Word (.docx) + PDF – du kannst alles selbst anpassen</p>
          </div>
          <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 group-hover:rotate-12 transition-all duration-300">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Schnelle Lieferung</h3>
            <p className="text-sm text-gray-600">2-3 Werktage Bearbeitungszeit – damit du keine Zeit verlierst</p>
          </div>
          <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 group-hover:rotate-12 transition-all duration-300">
              <RefreshCw className="h-6 w-6 text-orange-600 group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">1x Korrekturschleife</h3>
            <p className="text-sm text-gray-600">Wir passen Details an, bis du zufrieden bist</p>
          </div>
          <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 group-hover:rotate-12 transition-all duration-300">
              <Globe className="h-6 w-6 text-orange-600 group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Deutsch oder Englisch</h3>
            <p className="text-sm text-gray-600">Je nach Zielmarkt – du entscheidest</p>
          </div>
        </div>
      </div>

      {/* Nachbesserungs-Garantie */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
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
              <strong>Hinweis:</strong> Ein Anspruch auf Rückerstattung besteht nicht, sofern wir die vereinbarte Leistung erbracht und Nachbesserungen angeboten haben.
            </p>
          </div>
        </div>
      </div>
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
    <div className={`group pt-6 border-2 rounded-2xl shadow-lg px-6 pb-6 bg-white relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
      isRecommended ? 'border-orange-500 scale-105 shadow-orange-200 hover:scale-110' : 'border-gray-200 hover:border-orange-300'
    }`}>
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>Empfohlen</span>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-medium text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
        {product.name}
      </h2>
      <p className="text-sm text-gray-600 mb-4">{product.description}</p>
      <p className="text-4xl font-medium text-gray-900 mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">
        €{product.priceEuro}
        <span className="text-xl font-normal text-gray-600"> einmalig</span>
      </p>
      <ul className="space-y-3 mb-6">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start group/item">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={detailLink}
        className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-6 hover:text-orange-700 transition-colors"
      >
        {detailLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
      <Link
        href={`/kaufen?product=${product.productType}`}
        className={`group/btn relative w-full inline-flex items-center justify-center px-6 py-3 font-semibold text-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
          isRecommended ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
        <span className="relative z-10">Jetzt kaufen</span>
      </Link>
    </div>
  );
}
