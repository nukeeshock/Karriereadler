'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Track successful purchase (if analytics are enabled)
    if (sessionId) {
      console.log('Purchase completed:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white border border-orange-100 rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 p-8 sm:p-10 text-white">
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <p className="uppercase tracking-[0.2em] text-xs font-semibold text-orange-100">
                    Zahlung erfolgreich
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
                  Danke für deinen Kauf!
                </h1>
                <p className="text-orange-100 mt-2">
                  Deine Bestellung wurde erfolgreich abgeschlossen.
                </p>
              </div>
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white/90" />
            </div>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-10 space-y-8">
            {/* Next Steps */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-white/10 rounded-full" />
              <div className="relative">
                <p className="text-orange-100 text-sm mb-1">Deine nächsten Schritte</p>
                <h2 className="text-2xl font-bold mb-3">
                  Fragebogen im Dashboard ausfüllen
                </h2>
                <p className="text-orange-50 mb-4 max-w-2xl">
                  Um deinen Lebenslauf oder dein Anschreiben zu erstellen, benötigen wir noch einige
                  Informationen von dir. Bitte fülle den Fragebogen in deinem Dashboard aus.
                </p>
                <p className="text-orange-50 mb-6">
                  <strong>Wichtig:</strong> Erst nachdem du den Fragebogen vollständig ausgefüllt hast,
                  können wir mit der Erstellung deiner Bewerbungsunterlagen beginnen.
                </p>
                <Button
                  asChild
                  className="bg-white text-orange-600 hover:bg-orange-50"
                >
                  <Link href="/dashboard/orders">
                    Zum Dashboard – Fragebogen ausfüllen
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                📧 Bestätigungs-E-Mail
              </h3>
              <p className="text-blue-800 text-sm">
                Du erhältst in Kürze eine Bestätigungs-E-Mail mit weiteren Informationen und dem Link zum
                Fragebogen. Bitte überprüfe auch deinen Spam-Ordner.
              </p>
            </div>

            {/* Guarantee */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Zufriedenheitsgarantie
              </h3>
              <p className="text-green-800 text-sm">
                Solltest du mit dem Ergebnis nicht zufrieden sein, bieten wir dir eine kostenlose
                Überarbeitungsrunde an.
              </p>
            </div>

            {/* Support */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Fragen?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Falls du Hilfe benötigst oder Fragen hast, stehen wir dir gerne zur Verfügung.
              </p>
              <Button asChild variant="outline" className="border-orange-200 text-orange-700">
                <Link href="/contact">
                  Kontakt aufnehmen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
