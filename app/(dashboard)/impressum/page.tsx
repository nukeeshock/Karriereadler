import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImpressumPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Impressum</h1>
        <p className="text-gray-600">Angaben gemäß § 5 TMG</p>
      </div>

      <div className="space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Angaben gem. § 5 TMG</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Betreiber und Kontakt</h3>
              <p className="text-gray-700">[Firmenname / Name]</p>
              <p className="text-gray-700">[Straße und Hausnummer]</p>
              <p className="text-gray-700">[PLZ Ort]</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Kontakt</h3>
              <p className="text-gray-700">Telefon: [Telefonnummer]</p>
              <p className="text-gray-700">E-Mail: [E-Mail-Adresse]</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Umsatzsteuer-ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            </p>
            <p className="text-gray-700 font-semibold mt-2">[USt-IdNr.]</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Verantwortlich für den Inhalt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
            </p>
            <p className="text-gray-700 mt-2">[Name]</p>
            <p className="text-gray-700">[Adresse]</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>EU-Streitschlichtung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            </p>
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <p className="text-gray-700">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Verbraucher­streit­beilegung/Universal­schlichtungs­stelle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </CardContent>
        </Card>

      </div>
    </section>
  );
}
