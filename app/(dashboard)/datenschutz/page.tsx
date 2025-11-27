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
        {/* Einleitung */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>1. Datenschutz auf einen Blick</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Allgemeine Hinweise</h3>
              <p className="text-gray-700">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen
                Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Datenerfassung auf dieser Website</h3>
              <p className="text-gray-700 mb-2">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
                können Sie dem <Link href="/impressum" className="text-orange-600 hover:text-orange-700 underline">Impressum</Link> dieser Website entnehmen.
              </p>

              <p className="text-gray-700 mb-2">
                <strong>Wie erfassen wir Ihre Daten?</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um
                Daten handeln, die Sie in ein Kontaktformular eingeben oder bei der Registrierung angeben.
              </p>
              <p className="text-gray-700 mb-4">
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
                IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder
                Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
              </p>

              <p className="text-gray-700 mb-2">
                <strong>Wofür nutzen wir Ihre Daten?</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
                Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Zudem werden Ihre Daten zur
                Erstellung Ihres Lebenslaufs und Anschreibens verwendet.
              </p>

              <p className="text-gray-700 mb-2">
                <strong>Welche Rechte haben Sie bezüglich Ihrer Daten?</strong>
              </p>
              <p className="text-gray-700">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
                gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder
                Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben,
                können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter
                bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
                Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hosting */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>2. Hosting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Vercel</h3>
              <p className="text-gray-700 mb-2">
                Anbieter ist die Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA (nachfolgend "Vercel").
              </p>
              <p className="text-gray-700 mb-2">
                Vercel ist ein Dienst zum Hosting von Webseiten. Wenn Sie unsere Website besuchen, erfasst Vercel
                verschiedene Logfiles inklusive Ihrer IP-Adresse.
              </p>
              <p className="text-gray-700 mb-2">
                Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein
                berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website.
              </p>
              <p className="text-gray-700">
                Weitere Informationen finden Sie in der Datenschutzerklärung von Vercel:{' '}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  https://vercel.com/legal/privacy-policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Allgemeine Hinweise */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>3. Allgemeine Hinweise und Pflichtinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Datenschutz</h3>
              <p className="text-gray-700">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
                personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie
                dieser Datenschutzerklärung.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Hinweis zur verantwortlichen Stelle</h3>
              <p className="text-gray-700 mb-2">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-gray-700">
                [Die Kontaktdaten finden Sie im <Link href="/impressum" className="text-orange-600 hover:text-orange-700 underline">Impressum</Link>]
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Speicherdauer</h3>
              <p className="text-gray-700">
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben
                Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein
                berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen,
                werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung
                Ihrer personenbezogenen Daten haben.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
              <p className="text-gray-700">
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können
                eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf
                erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
              <p className="text-gray-700">
                Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer
                Aufsichtsbehörde zu. Das Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher
                oder gerichtlicher Rechtsbehelfe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Recht auf Datenübertragbarkeit</h3>
              <p className="text-gray-700">
                Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags
                automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format
                aushändigen zu lassen.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Auskunft, Löschung und Berichtigung</h3>
              <p className="text-gray-700">
                Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche
                Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck
                der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Datenerfassung */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>4. Datenerfassung auf dieser Website</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cookies</h3>
              <p className="text-gray-700 mb-2">
                Unsere Internetseiten verwenden Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät
                gespeichert werden und die Ihr Browser speichert. Cookies richten auf Ihrem Rechner keinen Schaden an
                und enthalten keine Viren.
              </p>
              <p className="text-gray-700 mb-2">
                Wir verwenden Cookies, um unsere Website nutzerfreundlicher zu gestalten. Einige Cookies bleiben auf
                Ihrem Endgerät gespeichert, bis Sie diese löschen. Sie ermöglichen es uns, Ihren Browser beim nächsten
                Besuch wiederzuerkennen.
              </p>
              <p className="text-gray-700">
                Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und
                Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell
                ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browsers aktivieren.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Server-Log-Dateien</h3>
              <p className="text-gray-700 mb-2">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten
                Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Browsertyp und Browserversion</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser
                Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Registrierung auf dieser Website</h3>
              <p className="text-gray-700 mb-2">
                Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. Die dazu
                eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder Dienstes,
                für den Sie sich registriert haben.
              </p>
              <p className="text-gray-700 mb-2">
                Die bei der Registrierung abgefragten Pflichtangaben (E-Mail-Adresse, Name) müssen vollständig
                angegeben werden. Anderenfalls werden wir die Registrierung ablehnen.
              </p>
              <p className="text-gray-700">
                Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt auf Grundlage Ihrer Einwilligung
                (Art. 6 Abs. 1 lit. a DSGVO). Sie können eine von Ihnen erteilte Einwilligung jederzeit widerrufen.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Anfrage per E-Mail oder Kontaktformular</h3>
              <p className="text-gray-700 mb-2">
                Wenn Sie uns per E-Mail oder Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
                Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage
                und für den Fall von Anschlussfragen bei uns gespeichert.
              </p>
              <p className="text-gray-700">
                Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre
                Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen
                erforderlich ist.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Zahlungsanbieter */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>5. Zahlungsanbieter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Stripe</h3>
              <p className="text-gray-700 mb-2">
                Anbieter für Kunden innerhalb der EU ist die Stripe Payments Europe Ltd., 1 Grand Canal Street Lower,
                Grand Canal Dock, Dublin, Irland (nachfolgend "Stripe").
              </p>
              <p className="text-gray-700 mb-2">
                Die Datenübertragung in die USA wird auf die Standardvertragsklauseln der EU-Kommission gestützt.
              </p>
              <p className="text-gray-700 mb-2">
                Wenn Sie die Bezahlfunktion von Stripe nutzen, werden Ihre Zahlungsdaten (z.B. Name, Zahlungssumme,
                Kontoverbindung, Kreditkartennummer) von Stripe zum Zwecke der Zahlungsabwicklung verarbeitet. Für
                diese Transaktionen gelten die jeweiligen Vertrags- und Datenschutzbestimmungen von Stripe.
              </p>
              <p className="text-gray-700 mb-2">
                Der Einsatz von Stripe erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsabwicklung) und
                Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und effizienten Zahlungsabwicklung).
              </p>
              <p className="text-gray-700">
                Details entnehmen Sie der Datenschutzerklärung von Stripe:{' '}
                <a
                  href="https://stripe.com/de/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  https://stripe.com/de/privacy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* E-Mail-Versand */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>6. E-Mail-Versand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Resend</h3>
              <p className="text-gray-700 mb-2">
                Wir versenden E-Mails über den Dienst Resend. Anbieter ist Resend, Inc., 340 S Lemon Ave #3717,
                Walnut, CA 91789, USA.
              </p>
              <p className="text-gray-700 mb-2">
                Resend ist ein Dienst zum technischen Versand von E-Mails. Wenn Sie sich auf unserer Website
                registrieren oder unsere Dienste nutzen, werden Ihre E-Mail-Adresse und weitere Daten zur
                Zustellbarkeit von E-Mails an Resend übermittelt.
              </p>
              <p className="text-gray-700 mb-2">
                Die Verwendung von Resend erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
                an einem zuverlässigen E-Mail-Versand) und Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
              </p>
              <p className="text-gray-700">
                Weitere Informationen finden Sie in der Datenschutzerklärung von Resend:{' '}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  https://resend.com/legal/privacy-policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Datenbank */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>7. Datenbanken und Speicherung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Neon (PostgreSQL)</h3>
              <p className="text-gray-700 mb-2">
                Wir nutzen Neon für die Speicherung von Nutzerdaten und Inhalten. Anbieter ist Neon, Inc., USA.
              </p>
              <p className="text-gray-700 mb-2">
                Ihre Daten werden verschlüsselt gespeichert. Wir speichern folgende Daten:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Registrierungsdaten (Name, E-Mail-Adresse)</li>
                <li>Lebenslauf- und Anschreiben-Anfragen mit allen eingegebenen Informationen</li>
                <li>Kaufhistorie und Credits</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Die Speicherung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und
                Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ihre Rechte */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>8. Ihre Rechte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 mb-2">Sie haben folgende Rechte:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen
                Daten verlangen.
              </li>
              <li>
                <strong>Berichtigungsrecht:</strong> Sie können die Berichtigung unrichtiger oder die Vervollständigung
                Ihrer bei uns gespeicherten personenbezogenen Daten verlangen.
              </li>
              <li>
                <strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer bei uns gespeicherten personenbezogenen
                Daten verlangen, soweit nicht die weitere Verarbeitung erforderlich ist.
              </li>
              <li>
                <strong>Einschränkung der Verarbeitung:</strong> Sie können die Einschränkung der Verarbeitung Ihrer
                personenbezogenen Daten verlangen.
              </li>
              <li>
                <strong>Datenübertragbarkeit:</strong> Sie können verlangen, dass wir Ihnen Ihre personenbezogenen
                Daten in einem strukturierten, gängigen und maschinenlesbaren Format übermitteln.
              </li>
              <li>
                <strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer personenbezogenen Daten
                jederzeit widersprechen.
              </li>
              <li>
                <strong>Widerruf der Einwilligung:</strong> Sofern die Verarbeitung auf Ihrer Einwilligung beruht,
                können Sie diese jederzeit widerrufen.
              </li>
              <li>
                <strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
                über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
