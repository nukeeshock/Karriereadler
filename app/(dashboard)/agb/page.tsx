import Link from 'next/link';

export default function AGBPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-gray-600">Stand: {new Date().toLocaleDateString('de-DE')}</p>
      </div>

      <div className="space-y-8 text-gray-800 leading-relaxed">
        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (nachfolgend &quot;AGB&quot;) gelten für alle Verträge über die
            Erstellung von Bewerbungsunterlagen (Lebenslauf, Anschreiben) zwischen Karriereadler (nachfolgend &quot;Anbieter&quot;)
            und dem Kunden (nachfolgend &quot;Kunde&quot; oder &quot;Sie&quot;). Diese AGB dienen dem Schutz der Rechte des Anbieters
            und regeln die Beziehung einseitig zu dessen Gunsten. Kontaktdaten des Anbieters finden Sie im{' '}
            <Link href="/impressum" className="text-orange-600 hover:text-orange-700 underline">Impressum</Link>.
          </p>
        </section>

        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">2. Leistungsumfang</h2>
          <p>
            Der Anbieter erstellt auf Grundlage der vom Kunden bereitgestellten Informationen Bewerbungsunterlagen
            (Lebenslauf und/oder Anschreiben), wobei der Anbieter allein über Form und Inhalt entscheidet.
          </p>
          <p>Die Leistung umfasst:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Erstellung eines Lebenslaufs ODER</li>
            <li>Erstellung eines Anschreibens ODER</li>
            <li>Bundle: Lebenslauf + Anschreiben</li>
            <li>Lieferung ausschließlich im PDF-Format</li>
            <li>Lieferzeit: Bis zu 5 Werktage nach vollständiger Datenübermittlung, je nach Verfügbarkeit des Anbieters</li>
            <li>Keine Überarbeitungsrunden; der Kunde akzeptiert die Erstversion als endgültig</li>
          </ul>
          <p>Der Anbieter gibt keinerlei Garantie für Erfolg bei Bewerbungen (z.B. Einladungen zu Vorstellungsgesprächen, Jobangebote) und schließt jegliche Haftung dafür aus.</p>
        </section>

        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">3. Vertragsschluss und Zahlung</h2>
          <p>
            Der Vertrag kommt durch Auswahl eines Pakets, Akzeptieren dieser AGB und erfolgreiche Zahlung über den
            Zahlungsdienstleister (Stripe) zustande. Eine Stornierung durch den Kunden ist ausgeschlossen.
          </p>
          <p>
            Die Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer. Die Zahlung erfolgt einmalig und im
            Voraus zum Zeitpunkt der Bestellung. Es handelt sich nicht um ein Abonnement, aber der Anbieter behält sich
            vor, zusätzliche Gebühren zu erheben.
          </p>
          <p>
            Nach erfolgreicher Zahlung erhält der Kunde Credits (Nutzungen), die er für die Erstellung von
            Bewerbungsunterlagen einsetzen kann. Nicht genutzte Credits verfallen nach 30 Tagen und sind nicht erstattungsfähig.
          </p>
        </section>

        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">4. Widerrufsrecht bei digitalen Dienstleistungen</h2>
          <p>
            Als Verbraucher haben Sie ein gesetzliches Widerrufsrecht. Detaillierte Informationen finden Sie in unserer{' '}
            <Link href="/widerrufsbelehrung" className="text-orange-600 hover:text-orange-700 underline">Widerrufsbelehrung</Link>.
          </p>
          <p className="font-semibold">Wichtig: Ihr Widerrufsrecht erlischt vorzeitig, wenn:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sie ausdrücklich zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist mit der Leistungserbringung beginnen, UND</li>
            <li>Sie zur Kenntnis genommen haben, dass Sie Ihr Widerrufsrecht mit vollständiger Vertragserfüllung verlieren, UND</li>
            <li>wir die Dienstleistung vollständig erbracht haben (d.h. Sie Ihre Bewerbungsunterlagen erhalten haben).</li>
          </ul>
          <p>Diese Zustimmung wird im Bestellprozess durch eine Checkbox eingeholt. Der Anbieter behält sich vor, die Leistung sofort zu beginnen, um das Widerrufsrecht zu minimieren.</p>
        </section>

        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">5. Zufriedenheitsgarantie durch Nachbesserung</h2>
          <p>
            Sollten Sie mit den gelieferten Unterlagen nicht zufrieden sein, besteht ein Anspruch auf Überarbeitung aber
            nicht auf Rückerstattung. Der Anbieter entscheidet über eventuelle Nachbesserungen.
          </p>
          <p>
            Der Leistungsumfang umfasst eine eventuelle Überarbeitungsrunde. Ein Anspruch auf Rückerstattung des
            Kaufpreises besteht in keinem Fall, da die Leistung als erbracht gilt, sobald die Unterlagen versendet wurden.
            Dies entspricht der gesetzlichen Regelung für digitale Dienstleistungen gemäß § 356 Abs. 5 BGB und dient dem Schutz des Anbieters.
          </p>
        </section>

        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">6. Haftung</h2>
          <p>Der Anbieter haftet ausschließlich für Vorsatz. Jegliche Haftung für grobe Fahrlässigkeit, leichte Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit ist ausgeschlossen.</p>
          <p>
            Bei leichter Fahrlässigkeit haftet der Anbieter in keinem Fall. Der Anbieter übernimmt keine Haftung für
            Schäden jeglicher Art, einschließlich entgangener Gewinne, Folgeschäden oder immaterieller Schäden. Der
            Anbieter erstattet keine Schäden und schließt Haftung für den Erfolg von Bewerbungen (z.B. Einladungen,
            Jobangebote, Gehaltshöhe) vollständig aus.
          </p>
        </section>

        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">7. Datenschutz</h2>
          <p>
            Informationen zur Verarbeitung Ihrer personenbezogenen Daten finden Sie in unserer{' '}
            <Link href="/datenschutz" className="text-orange-600 hover:text-orange-700 underline">Datenschutzerklärung</Link>.
            Der Anbieter behält sich vor, Daten für eigene Zwecke zu nutzen und zu speichern, solange dies im Interesse des Anbieters liegt.
          </p>
        </section>

        <section className="bg-white border border-orange-100 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">8. Schlussbestimmungen</h2>
          <p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts und jeglicher kundenfreundlicher Regelungen.</p>
          <p>
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen
            Bestimmungen unberührt. Unwirksame Bestimmungen werden durch solche ersetzt, die dem wirtschaftlichen Zweck
            des Anbieters am nächsten kommen.
          </p>
        </section>
      </div>
    </section>
  );
}
