import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, FileText, Clock, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lebenslauf schreiben lassen – Professionelle Erstellung ab 20 € | Karriereadler',
  description:
    'Lebenslauf schreiben lassen: Manuell erstellt von HR-Experten, ATS-optimiert, Lieferzeit 2–3 Werktage, Korrekturschleife inklusive.',
  alternates: {
    canonical: '/lebenslauf-schreiben-lassen'
  }
};

export default function LebenslaufLandingPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
              Lebenslauf-Service
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Lebenslauf schreiben lassen – von HR-Profis, nicht von Tools
            </h1>
            <p className="text-lg text-gray-700">
              Wir erstellen deinen Lebenslauf manuell: klar strukturiert, ATS-optimiert und auf deine Zielstelle zugeschnitten.
              In 2–3 Werktagen erhältst du dein fertiges Dokument als Word & PDF.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kaufen?product=cv"
                className="group inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Lebenslauf-Service jetzt buchen
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
                <Sparkles className="w-5 h-5 text-orange-500" /> ATS-optimiert
              </span>
            </div>
          </div>
          <div className="bg-white border border-orange-100 shadow-xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-10 h-10 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Paket</p>
                <p className="text-2xl font-bold text-gray-900">Lebenslauf schreiben lassen</p>
              </div>
            </div>
            <div className="text-4xl font-semibold text-gray-900">20 €</div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                Individuell erstellter Lebenslauf, keine Vorlage
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                Word (.docx) & PDF, sofort einsatzbereit
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
            title: 'HR-Expertise statt KI-Template',
            desc: 'Erfahrene Recruiter und Texter formulieren deinen Lebenslauf von Hand – inkl. Keyword-Fit für ATS.'
          },
          {
            title: 'Auf deine Zielstelle zugeschnitten',
            desc: 'Wir richten Aufbau, Bullet Points und Tonalität an der gewünschten Position aus.'
          },
          {
            title: 'Schnell & transparent',
            desc: 'Lieferung in 2–3 Werktagen, klare Kommunikation und eine Feedback-Runde inklusive.'
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
            <h2 className="text-3xl font-bold text-gray-900">In 3 Schritten zu deinem Lebenslauf</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '1. Infos teilen', desc: 'Berufserfahrung, Zielrolle und bisherige Unterlagen hochladen.' },
              { title: '2. Wir schreiben', desc: 'HR-Experten strukturieren, formulieren und optimieren deinen Lebenslauf.' },
              { title: '3. Erhalten & anpassen', desc: 'Du bekommst Word & PDF, inkl. einer Korrekturschleife.' }
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
          <h3 className="text-2xl font-bold text-gray-900 text-center">Das ist im Lebenslauf-Service enthalten</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Word (.docx) & PDF, editierbar',
              'Layout & Struktur an die Zielrolle angepasst',
              'ATS-optimierte Keywords & klare Bullet Points',
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
            <h3 className="text-3xl font-bold">Lebenslauf schreiben lassen ab 20 €</h3>
            <p className="text-orange-50 mt-2">Einmalig zahlen, 2–3 Werktage Lieferzeit, Korrekturschleife inklusive.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kaufen?product=cv"
              className="inline-flex items-center px-6 py-3 rounded-full bg-white text-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Lebenslauf-Service buchen
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
