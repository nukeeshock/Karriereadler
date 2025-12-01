import type { Metadata } from 'next';
import Script from 'next/script';
import { ArrowRight, Sparkles, Star, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/db/queries';
import KarriereadlerStory from '@/components/karriereadler-story';

const baseUrl = process.env.BASE_URL ?? 'https://karriereadler.com';
const aggregateRating = {
  ratingValue: '4.8',
  reviewCount: '200'
};

export const metadata: Metadata = {
  title: 'Lebenslauf schreiben lassen ab 20 € – Professionelle Erstellung | Karriereadler',
  description:
    'Lass deinen Lebenslauf professionell schreiben – ab 20 €, manuell von HR-Experten. ATS-optimiert, 2–3 Werktage Lieferzeit, inkl. Korrekturschleife.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Lebenslauf schreiben lassen ab 20 € | Karriereadler',
    description: 'Professioneller Lebenslauf von HR-Experten erstellt. ATS-optimiert, 2–3 Werktage, Korrekturschleife inklusive.',
    url: baseUrl,
    siteName: 'Karriereadler',
    locale: 'de_DE',
    type: 'website',
  },
};

export default async function HomePage() {
  const user = await getUser();

  const primaryCtaHref = '/kaufen';
  const secondaryCtaHref = '/pricing';

  return (
    <main>
      {/* Structured Data - Service */}
      <Script id="service-jsonld" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Service',
              name: 'Lebenslauf schreiben lassen',
              description:
                'Professionell erstellter Lebenslauf durch HR-Experten, ATS-optimiert, Lieferung in 2–3 Werktagen.',
              provider: {
                '@type': 'Organization',
                name: 'Karriereadler',
                url: baseUrl,
                logo: `${baseUrl}/logo_adler_notagline.png`
              },
              areaServed: 'DE',
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EUR',
                price: '20.00',
                url: `${baseUrl}/kaufen?product=cv`,
                availability: 'https://schema.org/InStock'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: aggregateRating.ratingValue,
                reviewCount: aggregateRating.reviewCount
              }
            },
            {
              '@type': 'Service',
              name: 'Anschreiben schreiben lassen',
              description:
                'Individuell formuliertes Anschreiben für deine Zielposition, manuell erstellt von Karriereadler.',
              provider: {
                '@type': 'Organization',
                name: 'Karriereadler',
                url: baseUrl,
                logo: `${baseUrl}/logo_adler_notagline.png`
              },
              areaServed: 'DE',
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EUR',
                price: '20.00',
                url: `${baseUrl}/kaufen?product=cover`,
                availability: 'https://schema.org/InStock'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: aggregateRating.ratingValue,
                reviewCount: aggregateRating.reviewCount
              }
            }
          ]
        })}
      </Script>

      {/* Hero Section */}
      <section className="relative py-16 md:py-20">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/adler_background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-white/85"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              {/* H1 with main keyword */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                Lebenslauf schreiben lassen
                <span className="block text-orange-500 mt-1">
                  ab 20 € – von Experten erstellt
                </span>
              </h1>
              
              {/* SEO-optimized intro paragraph */}
              <p className="mt-6 text-lg text-gray-600 max-w-xl">
                Lass deinen <strong>Lebenslauf professionell erstellen</strong> – manuell von HR-Experten, 
                individuell auf deine Zielstelle zugeschnitten. ATS-optimiert, 
                Lieferung in 2–3 Werktagen, Korrekturschleife inklusive.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                >
                  Jetzt Lebenslauf erstellen lassen
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  Preise ansehen
                </Link>
              </div>

              {/* Trust Signal */}
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                <span>4.8/5 Bewertung · 200+ zufriedene Kunden</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-12 lg:mt-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-sm font-medium text-orange-600 uppercase tracking-wide mb-4">
                  So funktioniert's
                </p>
                
                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
                  <p className="text-sm font-semibold text-gray-900">
                    Lebenslauf 20 € · Anschreiben 20 € · Bundle 30 €
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Einmalige Zahlung – kein Abo, keine versteckten Kosten
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </span>
                    <p className="text-sm text-gray-700">
                      <strong>Fragebogen ausfüllen</strong> – Daten, Erfahrungen und Wunschstelle angeben
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </span>
                    <p className="text-sm text-gray-700">
                      <strong>Paket wählen</strong> – Lebenslauf, Anschreiben oder Bundle
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </span>
                    <p className="text-sm text-gray-700">
                      <strong>Fertig!</strong> – Professionelle Unterlagen in 2–3 Werktagen per E-Mail
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <Link
                    href="/lebenslauf-schreiben-lassen"
                    className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Mehr zum Lebenslauf-Service →
                  </Link>
                  <Link
                    href="/anschreiben-schreiben-lassen"
                    className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Mehr zum Anschreiben-Service →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Warum deinen Lebenslauf von Karriereadler schreiben lassen?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ein professioneller Lebenslauf ist der Schlüssel zum Traumjob. Unsere HR-Experten wissen, worauf Personaler achten.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="p-6 bg-white border border-gray-100 rounded-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Struktur statt Chaos</h3>
              <p className="text-sm text-gray-600">
                Deine Stationen werden so sortiert, dass sie einen roten Faden ergeben – perfekt für den ersten Eindruck.
              </p>
            </article>
            <article className="p-6 bg-white border border-gray-100 rounded-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Authentische Formulierungen</h3>
              <p className="text-sm text-gray-600">
                Kein Phrasen-Bingo – sondern Texte, die zu dir passen und deine Stärken hervorheben.
              </p>
            </article>
            <article className="p-6 bg-white border border-gray-100 rounded-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-2">ATS-optimiert</h3>
              <p className="text-sm text-gray-600">
                Dein Lebenslauf wird von Bewerbermanagementsystemen korrekt erkannt – höhere Einladungsquote.
              </p>
            </article>
            <article className="p-6 bg-white border border-gray-100 rounded-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Korrekturschleife inklusive</h3>
              <p className="text-sm text-gray-600">
                Nicht 100% zufrieden? Eine Überarbeitungsrunde ist bei jedem Paket mit dabei.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Erfahrungen unserer Kunden
            </h2>
            <p className="text-gray-600">
              Über 200 zufriedene Kunden haben ihren Lebenslauf von Karriereadler erstellen lassen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Der Lebenslauf war perfekt auf die Stelle zugeschnitten. Nach nur zwei Wochen hatte ich drei Vorstellungsgespräche!",
                name: "Sarah K.",
                role: "Marketing Manager",
                initials: "SK"
              },
              {
                quote: "Endlich kein stundenlanger Kampf mit Formatierungen! Das Anschreiben klang professionell und persönlich – genau richtig.",
                name: "Michael H.",
                role: "Software-Entwickler",
                initials: "MH"
              },
              {
                quote: "Als Quereinsteiger war ich unsicher, wie ich meine Erfahrungen darstellen soll. Das Team hat das perfekt gelöst!",
                name: "Laura M.",
                role: "Projektmanagerin",
                initials: "LM"
              }
            ].map((testimonial, i) => (
              <article key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <cite className="font-medium text-gray-900 not-italic">{testimonial.name}</cite>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <KarriereadlerStory />

      {/* How it works - detailed section */}
      <section id="mehr-erfahren" className="py-12 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              So lässt du deinen Lebenslauf professionell schreiben
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              In nur drei Schritten zu deinen fertigen Bewerbungsunterlagen
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <article>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100 text-orange-600 mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fragebogen ausfüllen
              </h3>
              <p className="text-gray-600">
                Gib deine Daten, beruflichen Erfahrungen, Ausbildung und Wunschposition an. 
                Je mehr Details, desto besser können wir deinen Lebenslauf auf die Stelle zuschneiden.
              </p>
            </article>

            <article>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100 text-orange-600 mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Experten erstellen deine Unterlagen
              </h3>
              <p className="text-gray-600">
                Unsere HR-Experten analysieren dein Profil und erstellen einen individuellen, 
                ATS-optimierten Lebenslauf – keine Vorlagen, sondern maßgeschneiderte Texte.
              </p>
            </article>

            <article>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100 text-orange-600 mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fertige Dokumente erhalten
              </h3>
              <p className="text-gray-600">
                In 2–3 Werktagen erhältst du deine fertigen Unterlagen per E-Mail als Word- und PDF-Datei. 
                Eine Korrekturschleife ist inklusive.
              </p>
            </article>
          </div>
          
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Bereit für den perfekten Lebenslauf?
          </h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            Professioneller Lebenslauf ab 20 € – von HR-Experten erstellt, ATS-optimiert, in 2–3 Werktagen fertig.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kaufen"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-orange-600 bg-white hover:bg-gray-50 rounded-lg shadow-sm hover:shadow transition-all duration-200"
            >
              Jetzt starten
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white/50 hover:border-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Fragen? Kontaktiere uns
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
