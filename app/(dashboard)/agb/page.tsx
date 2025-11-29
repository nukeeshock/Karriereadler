import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AGBPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-gray-600">Stand: {new Date().toLocaleDateString('de-DE')}</p>
      </div>

      {/* TODO Notice */}
      <div className="mb-8 bg-orange-100 border-2 border-orange-300 rounded-xl p-6 flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-orange-900 mb-2">TODO: Rechtsanwalt konsultieren</h2>
          <p className="text-sm text-orange-800">
            Diese AGB sind ein Platzhalter-Template. Lassen Sie die finalen AGB unbedingt von einem Fachanwalt für IT-Recht prüfen und an Ihr Geschäftsmodell anpassen.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Geltungsbereich */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>1. Geltungsbereich</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Verträge über die Erstellung von Bewerbungsunterlagen (Lebenslauf, Anschreiben) zwischen Karriereadler (nachfolgend "Anbieter") und dem Kunden (nachfolgend "Kunde" oder "Sie").
            </p>
            <p className="text-gray-700">
              Kontaktdaten des Anbieters finden Sie im <Link href="/impressum" className="text-orange-600 hover:text-orange-700 underline">Impressum</Link>.
            </p>
          </CardContent>
        </Card>

        {/* Leistungsumfang */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>2. Leistungsumfang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Der Anbieter erstellt auf Grundlage der vom Kunden bereitgestellten Informationen individuell formulierte Bewerbungsunterlagen (Lebenslauf und/oder Anschreiben).
            </p>
            <p className="text-gray-700">
              Die Leistung umfasst:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Erstellung eines professionellen Lebenslaufs ODER</li>
              <li>Erstellung von zwei individuellen Anschreiben ODER</li>
              <li>Bundle: Lebenslauf + zwei Anschreiben</li>
              <li>Lieferung in den Formaten Word (.docx) und PDF</li>
              <li>Lieferzeit: 2-3 Werktage nach vollständiger Datenübermittlung</li>
              <li>1 Überarbeitungsrunde innerhalb von 14 Tagen nach Erhalt der Erstversion</li>
            </ul>
            <p className="text-gray-700 font-semibold">
              Der Anbieter gibt keine Garantie für Erfolg bei Bewerbungen (z.B. Einladungen zu Vorstellungsgesprächen, Jobangebote).
            </p>
          </CardContent>
        </Card>

        {/* Vertragsschluss */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>3. Vertragsschluss und Zahlung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Der Vertrag kommt durch Auswahl eines Pakets, Akzeptieren dieser AGB und erfolgreiche Zahlung über den Zahlungsdienstleister (Stripe) zustande.
            </p>
            <p className="text-gray-700">
              Die Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer. Die Zahlung erfolgt einmalig zum Zeitpunkt der Bestellung. Es handelt sich nicht um ein Abonnement.
            </p>
            <p className="text-gray-700">
              Nach erfolgreicher Zahlung erhält der Kunde Credits (Nutzungen), die er für die Erstellung von Bewerbungsunterlagen einsetzen kann.
            </p>
          </CardContent>
        </Card>

        {/* Widerrufsrecht */}
        <Card className="border-2 shadow-lg border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle>4. Widerrufsrecht bei digitalen Dienstleistungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Als Verbraucher haben Sie ein gesetzliches Widerrufsrecht. Detaillierte Informationen finden Sie in unserer{' '}
              <Link href="/widerrufsbelehrung" className="text-orange-600 hover:text-orange-700 underline font-semibold">
                Widerrufsbelehrung
              </Link>.
            </p>
            <p className="text-gray-700 font-semibold">
              Wichtig: Ihr Widerrufsrecht erlischt vorzeitig, wenn:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Sie ausdrücklich zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist mit der Leistungserbringung beginnen, UND</li>
              <li>Sie zur Kenntnis genommen haben, dass Sie Ihr Widerrufsrecht mit vollständiger Vertragserfüllung verlieren, UND</li>
              <li>wir die Dienstleistung vollständig erbracht haben (d.h. Sie Ihre finalen Bewerbungsunterlagen erhalten haben).</li>
            </ul>
            <p className="text-gray-700">
              Diese Zustimmung wird im Bestellprozess durch eine Checkbox eingeholt.
            </p>
          </CardContent>
        </Card>

        {/* Nachbesserung statt Rückerstattung */}
        <Card className="border-2 shadow-lg border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle>5. Zufriedenheitsgarantie durch Nachbesserung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Sollten Sie mit den gelieferten Unterlagen nicht zufrieden sein, haben Sie das Recht, innerhalb von <strong>14 Tagen nach Erhalt der Erstversion</strong> eine Überarbeitung anzufordern.
            </p>
            <p className="text-gray-700">
              Der Leistungsumfang umfasst <strong>1 Überarbeitungsrunde</strong>. Weitere Überarbeitungen können gegen Aufpreis angefragt werden.
            </p>
            <p className="text-gray-700 font-semibold">
              Ein Anspruch auf Rückerstattung des Kaufpreises besteht nicht, sofern:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>die vereinbarte Leistung (individuell erstellte Bewerbungsunterlagen) erbracht wurde, UND</li>
              <li>die inkludierte Nachbesserungsmöglichkeit angeboten wurde.</li>
            </ul>
            <p className="text-gray-700">
              Dies entspricht der gesetzlichen Regelung für digitale Dienstleistungen gemäß § 356 Abs. 5 BGB.
            </p>
          </CardContent>
        </Card>

        {/* Haftung */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>6. Haftung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.
            </p>
            <p className="text-gray-700">
              Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten. In diesem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
            </p>
            <p className="text-gray-700">
              Der Anbieter übernimmt keine Haftung für den Erfolg von Bewerbungen (z.B. Einladungen, Jobangebote, Gehaltshöhe).
            </p>
          </CardContent>
        </Card>

        {/* Datenschutz */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>7. Datenschutz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Informationen zur Verarbeitung Ihrer personenbezogenen Daten finden Sie in unserer{' '}
              <Link href="/datenschutz" className="text-orange-600 hover:text-orange-700 underline">
                Datenschutzerklärung
              </Link>.
            </p>
          </CardContent>
        </Card>

        {/* Schlussbestimmungen */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>8. Schlussbestimmungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p className="text-gray-700">
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
