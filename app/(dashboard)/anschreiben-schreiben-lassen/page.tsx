import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Mail, Clock, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Anschreiben schreiben lassen – Individuell ab 20 € | Karriereadler',
  description:
    'Anschreiben schreiben lassen: Individuell formuliert von HR-Profis, angepasst an deine Zielstelle, Lieferzeit 2–3 Werktage, inkl. Korrekturschleife.',
  alternates: {
    canonical: '/anschreiben-schreiben-lassen'
  }
};

export default function AnschreibenLandingPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
              Anschreiben-Service
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Anschreiben schreiben lassen – präzise auf die Stelle abgestimmt
            </h1>
            <p className="text-lg text-gray-700">
              Wir formulieren dein Anschreiben individuell, mit klarer Argumentation und passender Tonalität für deine Wunschposition.
              Fertig in 2–3 Werktagen, inklusive einer Feedback-Runde.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kaufen?product=cover"
                className="group inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Anschreiben-Service buchen
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-5 py-3 rounded-full border-2 border-orange-200 text-orange-700 font-semibold hover:border-orange-400 transition-all"
              >
                Preise ansehen
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <span className="inline-flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500" /> Ab 20 € einmalig
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" /> Lieferung in 2–3 Werktagen
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" /> Passende Tonalität & Story
              </span>
            </div>
          </div>
          <div className="bg-white border border-orange-100 shadow-xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-10 h-10 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Paket</p>
                <p className="text-2xl font-bold text-gray-900">Anschreiben schreiben lassen</p>
              </div>
            </div>
            <div className="text-4xl font-semibold text-gray-900">20 €</div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                Individuell formuliertes Anschreiben, keine Vorlage
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                Storyline & Tonalität passend zur Zielstelle
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                Eine Korrekturschleife inklusive
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* USP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-3 gap-6">
        {[
          {
            title: 'Auf die Rolle zugeschnitten',
            desc: 'Wir spiegeln Anforderungen der Stellenausschreibung und highlighten relevante Erfolge.'
          },
          {
            title: 'Klarer roter Faden',
            desc: 'Argumentation, warum du passt – in klaren, recruiterfreundlichen Sätzen.'
          },
          {
            title: 'Schnell & persönlich',
            desc: '2–3 Werktage Lieferzeit, individuelle Rückfragen inklusive.'
          }
        ].map((item) => (
          <div key={item.title} className="p-6 border border-orange-100 rounded-xl shadow-sm bg-white">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-700">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Prozess */}
      <section className="bg-gradient-to-r from-orange-50 to-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">Ablauf</p>
            <h2 className="text-3xl font-bold text-gray-900">So bekommst du dein Anschreiben</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '1. Infos teilen', desc: 'Zielstelle, Lebenslauf und besondere Schwerpunkte mitgeben.' },
              { title: '2. Wir formulieren', desc: 'Storyline, Nutzenargumente und Tonalität werden individuell ausgearbeitet.' },
              { title: '3. Erhalten & feinjustieren', desc: 'Du bekommst Word & PDF – inkl. einer Korrekturschleife.' }
            ].map((step, index) => (
              <div key={step.title} className="p-6 bg-white border border-orange-100 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white border border-orange-100 rounded-2xl shadow-md p-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 text-center">Das ist im Anschreiben-Service enthalten</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Individuelle Argumentation für die Zielstelle',
              'Passende Tonalität & klare Struktur',
              'Word (.docx) & PDF, editierbar',
              'Eine Korrekturschleife inklusive'
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-orange-50 font-semibold">Jetzt starten</p>
            <h3 className="text-3xl font-bold">Anschreiben schreiben lassen ab 20 €</h3>
            <p className="text-orange-50 mt-2">Einmalig zahlen, 2–3 Werktage Lieferzeit, Korrekturschleife inklusive.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kaufen?product=cover"
              className="inline-flex items-center px-6 py-3 rounded-full bg-white text-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Anschreiben-Service buchen
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-5 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition-all"
            >
              Preise vergleichen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
