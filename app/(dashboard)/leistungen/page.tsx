import Link from 'next/link';
import { CheckCircle, FileText, Mail, Clock, RefreshCw, Globe, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Unsere Leistungen | Karriereadler',
  description: 'Professionelle Lebenslauf- und Anschreiben-Erstellung von Experten. Individuell, ATS-optimiert, in 2-3 Werktagen.'
};

export default function LeistungenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              So funktioniert der Karriereadler-Service
            </h1>
            <p className="text-xl text-orange-50 leading-relaxed">
              Wir erstellen professionelle Bewerbungsunterlagen – komplett für dich.
              Kein Template-Tool, sondern echte Experten, die deine Karriere verstehen.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* What We Offer */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Was macht Karriereadler anders?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Wir sind <strong>kein Template-Generator</strong>. Bei uns erstellen echte Menschen
              deine Bewerbungsunterlagen – individuell auf deine Zielstelle zugeschnitten.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Von Experten erstellt</h3>
              <p className="text-gray-600">
                Erfahrene HR-Profis und Branchenkenner schreiben deine Unterlagen.
                Kein Algorithmus, sondern echtes Fachwissen.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Individuell & ATS-optimiert</h3>
              <p className="text-gray-600">
                Maßgeschneidert auf deine Zielstelle und Branche.
                Optimiert für Bewerbermanagementsysteme (ATS).
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Schnell & unkompliziert</h3>
              <p className="text-gray-600">
                Deine fertigen Unterlagen erhältst du in 2-3 Werktagen per E-Mail.
                Sofort einsatzbereit.
              </p>
            </div>
          </div>
        </section>

        {/* 3-Step Process */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">In 3 Schritten zu deinen Unterlagen</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 to-orange-500 transform -translate-x-1/2" />

              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row items-center mb-12">
                <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0">
                  <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        1
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Formular ausfüllen</h3>
                    </div>
                    <p className="text-gray-600">
                      Gib deine Daten ein: Berufserfahrung, Ausbildung, Fähigkeiten.
                      Optional kannst du die Stellenausschreibung hochladen, damit wir deine
                      Unterlagen perfekt darauf abstimmen können.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="text-center md:text-left">
                    <div className="inline-block bg-orange-100 rounded-full p-6">
                      <FileText className="w-12 h-12 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row-reverse items-center mb-12">
                <div className="md:w-1/2 md:pl-12 mb-6 md:mb-0">
                  <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        2
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Paket wählen</h3>
                    </div>
                    <p className="text-gray-600">
                      Wähle zwischen Lebenslauf (20 €), Anschreiben (20 €) oder unserem
                      Bundle (30 €, spart 10 €). Einmalige Zahlung, kein Abo.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pr-12">
                  <div className="text-center md:text-right">
                    <div className="inline-block bg-orange-100 rounded-full p-6">
                      <CheckCircle className="w-12 h-12 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0">
                  <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        3
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Zurücklehnen</h3>
                    </div>
                    <p className="text-gray-600">
                      Unsere Experten erstellen deine Unterlagen. In 2-3 Werktagen erhältst du
                      sie per E-Mail – professionell, individuell und sofort einsatzbereit.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="text-center md:text-left">
                    <div className="inline-block bg-orange-100 rounded-full p-6">
                      <Mail className="w-12 h-12 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 sm:p-12 border border-orange-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Das bekommst du von uns</h2>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Editierbare Formate</h3>
                  <p className="text-gray-600">Word (.docx) + PDF-Version – du kannst alles selbst anpassen</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Lieferzeit 2-3 Werktage</h3>
                  <p className="text-gray-600">Schnelle Bearbeitung, damit du keine Zeit verlierst</p>
                </div>
              </div>

              <div className="flex items-start">
                <Globe className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Sprache: Deutsch oder Englisch</h3>
                  <p className="text-gray-600">Je nach Zielmarkt – du entscheidest</p>
                </div>
              </div>

              <div className="flex items-start">
                <RefreshCw className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">1x Korrekturschleife inklusive</h3>
                  <p className="text-gray-600">Wir passen Details an, bis du zufrieden bist</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white rounded-xl border border-orange-200">
              <h3 className="font-bold text-gray-900 mb-2">📦 Bundle-Vorteil</h3>
              <p className="text-gray-600">
                <strong>Lebenslauf + Anschreiben (2×) im Bundle für nur 30 €</strong> –
                du sparst 10 € und hast eine durchgängig professionelle Bewerbung.
              </p>
            </div>
          </div>
        </section>

        {/* Nachbesserungs-Garantie */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
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
                  <strong>Wichtig:</strong> Ein Anspruch auf Rückerstattung besteht nicht, sofern wir die vereinbarte Leistung erbracht und Nachbesserungen angeboten haben. Dies entspricht der gesetzlichen Regelung für vollständig erbrachte digitale Dienstleistungen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mini FAQ */}
        <section className="mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Häufige Fragen</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Für wen ist Karriereadler geeignet?</h3>
                <p className="text-gray-600">
                  Für Berufseinsteiger, Fachkräfte und Quereinsteiger – alle, die professionelle
                  Bewerbungsunterlagen brauchen, ohne selbst Designer oder Texter sein zu müssen.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Wie funktioniert die Korrekturschleife?</h3>
                <p className="text-gray-600">
                  Nach Erhalt deiner Unterlagen kannst du einmalig Änderungswünsche äußern
                  (z. B. Formulierungen anpassen, Details ergänzen). Wir setzen das zeitnah um.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Sind die Unterlagen ATS-tauglich?</h3>
                <p className="text-gray-600">
                  Ja! Wir optimieren Formatierung und Keywords für Bewerbermanagementsysteme (ATS),
                  damit deine Bewerbung auch automatische Screenings besteht.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Was passiert mit meinen Daten?</h3>
                <p className="text-gray-600">
                  Deine Daten werden ausschließlich zur Erstellung deiner Bewerbungsunterlagen genutzt
                  und DSGVO-konform verarbeitet. Details findest du in unserer{' '}
                  <Link href="/datenschutz" className="text-orange-600 hover:underline">
                    Datenschutzerklärung
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Bereit für deine professionelle Bewerbung?</h2>
            <p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
              Wähle dein Paket und erhalte in 2-3 Werktagen deine fertigen Unterlagen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-6 rounded-full font-bold shadow-lg">
                <Link href="/pricing">
                  Preise ansehen
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 text-lg px-8 py-6 rounded-full font-bold">
                <Link href="/contact">
                  Fragen? Kontaktiere uns
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
