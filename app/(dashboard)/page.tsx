import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/db/queries';
import KarriereadlerStory from '@/components/karriereadler-story';

export default async function HomePage() {
  const user = await getUser();
  const hasCredits = (user?.cvCredits || 0) > 0 || (user?.letterCredits || 0) > 0;
  const ctaHref = user ? (hasCredits ? '/cv' : '/dashboard/buy') : '/sign-in';

  return (
    <main>
      <section className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/adler_background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-white/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Professioneller Lebenslauf
                <span className="block text-orange-500">
                  von Experten erstellt
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Karriereadler erstellt deinen Lebenslauf und dein Anschreiben
                manuell – professionell, individuell und auf deine Zielstelle
                zugeschnitten. Du bekommst deinen fertigen Lebenslauf per E-Mail.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="text-lg rounded-full bg-orange-500 hover:bg-orange-600 animate-pulse shadow-lg"
                  >
                    <Link href={ctaHref}>
                      Lebenslauf-Service für 20 €
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full bg-white/90 backdrop-blur-sm"
                  >
                    <Link href="#mehr-erfahren">Mehr erfahren</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="w-full rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg p-6 space-y-4">
                <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold">
                  So einfach geht’s
                </p>
                <div className="text-sm text-gray-800 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                  <div className="font-semibold text-orange-600">
                    Lebenslauf 20 € • Anschreiben 20 € • Bundle 30 €
                  </div>
                  <div className="text-gray-700">
                    Einmal zahlen, sofort Texte erhalten – kein Abo.
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex gap-3">
                    <span className="text-orange-500 font-semibold">1</span>
                    <p>Formular ausfüllen – kurz deine Daten, Erfahrungen und Wunschstelle angeben.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-orange-500 font-semibold">2</span>
                    <p>Paket wählen – Lebenslauf, Anschreiben oder Bundle auswählen und einmalig bezahlen.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-orange-500 font-semibold">3</span>
                    <p>Zurücklehnen – wir erstellen deine Unterlagen individuell von Hand und senden dir den fertigen Lebenslauf per E-Mail zu.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                  >
                    <Link href={ctaHref}>Jetzt starten</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <Link href="#mehr-erfahren">Mehr erfahren</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <KarriereadlerStory />

      <section id="mehr-erfahren" className="py-16 bg-white w-full scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Von Experten erstellt
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Dein Lebenslauf wird manuell von erfahrenen Bewerbungsexperten
                  erstellt – individuell, prägnant und perfekt auf die Zielstelle
                  zugeschnitten.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Einmal zahlen, fertig
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Kauf nur, was du brauchst: Lebenslauf, Anschreiben oder Bundle –
                  einmalig bezahlen, nutzen.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Sofort startklar
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Einloggen, einmal zahlen, Texte einfügen, fertig. Keine
                  Design-Tools, kein Setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
