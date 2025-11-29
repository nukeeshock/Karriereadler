import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function WiderrufsbelehrungPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Widerrufsbelehrung</h1>
        <p className="text-gray-600">Informationen zu Ihrem Widerrufsrecht bei digitalen Dienstleistungen</p>
      </div>

      {/* TODO Notice */}
      <div className="mb-8 bg-orange-100 border-2 border-orange-300 rounded-xl p-6 flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-orange-900 mb-2">TODO: Rechtsanwalt konsultieren</h2>
          <p className="text-sm text-orange-800">
            Dieser Text ist ein Platzhalter. Bitte lassen Sie die finale Widerrufsbelehrung von einem Fachanwalt für IT-Recht prüfen und ggf. anpassen. Die hier dargestellten Regelungen basieren auf der aktuellen Gesetzeslage für digitale Dienstleistungen (§ 356 Abs. 5 BGB).
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Widerrufsrecht */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Widerrufsrecht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
            </p>
            <p className="text-gray-700">
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses (bei Kauf digitaler Credits/Dienstleistungen).
            </p>
            <p className="text-gray-700">
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Karriereadler, {/* TODO: Adresse einfügen */} [Firmenname, Straße, PLZ Ort], E-Mail: [E-Mail-Adresse]) mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
            </p>
            <p className="text-gray-700">
              Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
            </p>
          </CardContent>
        </Card>

        {/* Vorzeitiger Beginn der Leistung */}
        <Card className="border-2 shadow-lg border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle>Vorzeitiger Beginn der Leistungserbringung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              <strong>Wichtig:</strong> Wenn Sie verlangen, dass die Dienstleistung während der Widerrufsfrist beginnen soll, sind Sie verpflichtet, uns einen entsprechenden Auftrag zu erteilen.
            </p>
            <p className="text-gray-700">
              Im Bestellprozess wird Ihre ausdrückliche Zustimmung eingeholt, dass wir vor Ablauf der Widerrufsfrist mit der Leistungserbringung (Erstellung Ihres Lebenslaufs bzw. Anschreibens) beginnen.
            </p>
            <p className="text-gray-700 font-semibold">
              Ihr Widerrufsrecht erlischt vorzeitig, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben haben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren.
            </p>
          </CardContent>
        </Card>

        {/* Folgen des Widerrufs */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Folgen des Widerrufs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
            </p>
            <p className="text-gray-700">
              Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
            </p>
            <p className="text-gray-700 font-semibold">
              Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
            </p>
          </CardContent>
        </Card>

        {/* Erlöschen bei vollständiger Leistung */}
        <Card className="border-2 shadow-lg border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle>Erlöschen des Widerrufsrechts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              <strong>Das Widerrufsrecht erlischt bei einem Vertrag zur Erbringung von Dienstleistungen, wenn der Unternehmer die Dienstleistung vollständig erbracht hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem der Verbraucher dazu seine ausdrückliche Zustimmung gegeben hat und gleichzeitig seine Kenntnis davon bestätigt hat, dass er sein Widerrufsrecht bei vollständiger Vertragserfüllung durch den Unternehmer verliert (§ 356 Abs. 5 BGB).</strong>
            </p>
            <p className="text-gray-700">
              Das bedeutet konkret: Sobald Sie Ihre finalen Bewerbungsunterlagen (Lebenslauf bzw. Anschreiben) erhalten haben und wir die Dienstleistung damit vollständig erbracht haben, erlischt Ihr Widerrufsrecht.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
