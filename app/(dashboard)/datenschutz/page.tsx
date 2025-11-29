import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DatenschutzPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-gray-600">Stand: {new Date().toLocaleDateString('de-DE')}</p>
      </div>

      <div className="space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Was du wissen musst (Kurzfassung)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Wir verarbeiten nur, was wir für Auftrag, Support und Betrieb brauchen.</li>
              <li>Verantwortlich ist das Karriereadler-Team – Kontaktdaten im <Link href="/impressum" className="text-orange-600 hover:text-orange-700 underline">Impressum</Link>.</li>
              <li>Keine Tracking-Pixel oder Werbe-Cookies; nur technisch notwendige Sessions.</li>
              <li>Du kannst Auskunft, Löschung, Berichtigung, Widerruf oder Datenübertragbarkeit verlangen.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Welche Daten wir verarbeiten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Accountdaten: Name, E-Mail, Passwort-Hash; optionale Adresse/Profilangaben.</li>
              <li>Aufträge & Fragebögen: Angaben zu Lebenslauf/Anschreiben, optionale Links (z.B. LinkedIn), hochgeladene Dateien.</li>
              <li>Zahlungsdaten: werden über Stripe verarbeitet (wir speichern keine vollständigen Karteninfos).</li>
              <li>Support: Inhalte aus Kontaktformular oder E-Mails.</li>
              <li>Technische Logs: IP-Adresse, Browser, Zeitpunkt des Zugriffs für Betriebssicherheit.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Warum & wie lange</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Vertrag & Durchführung: Bearbeitung deiner Aufträge, Zahlung, Support (Art. 6 Abs. 1 lit. b DSGVO).</li>
              <li>Betrieb & Sicherheit: Logs, Missbrauchsschutz, zuverlässiges Hosting (Art. 6 Abs. 1 lit. f DSGVO).</li>
              <li>Einwilligung: Newsletter/optionale Angaben kannst du jederzeit widerrufen.</li>
              <li>Speicherdauer: solange dein Account/auftrag besteht oder wir gesetzlich dazu verpflichtet sind; danach löschen oder anonymisieren wir.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Drittanbieter, die wir einsetzen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Hosting: Vercel Inc., USA – <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">Datenschutzerklärung</a></li>
              <li>Zahlung: Stripe Payments Europe Ltd. (EU) / Stripe Inc. – <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">Datenschutzerklärung</a></li>
              <li>E-Mail: Resend, Inc., USA – <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">Datenschutzerklärung</a></li>
              <li>Datenbank: Neon (PostgreSQL), USA – verschlüsselte Speicherung.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Deine Rechte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit.</li>
              <li>Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen.</li>
              <li>Widerruf erteilter Einwilligungen jederzeit möglich.</li>
              <li>Beschwerderecht bei der zuständigen Datenschutz-Aufsichtsbehörde.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-2">
            <p>Karriereadler Team – Kontaktdaten im <Link href="/impressum" className="text-orange-600 hover:text-orange-700 underline">Impressum</Link>.</p>
            <p>E-Mail: <a href="mailto:info@karriereadler.com" className="text-orange-600 hover:text-orange-700 underline">info@karriereadler.com</a></p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
