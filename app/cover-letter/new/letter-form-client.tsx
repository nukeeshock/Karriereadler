'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/lib/db/schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const EU_COUNTRIES = [
  { code: 'AT', label: 'Österreich', flag: '🇦🇹' },
  { code: 'BE', label: 'Belgien', flag: '🇧🇪' },
  { code: 'BG', label: 'Bulgarien', flag: '🇧🇬' },
  { code: 'HR', label: 'Kroatien', flag: '🇭🇷' },
  { code: 'CY', label: 'Zypern', flag: '🇨🇾' },
  { code: 'CZ', label: 'Tschechien', flag: '🇨🇿' },
  { code: 'DK', label: 'Dänemark', flag: '🇩🇰' },
  { code: 'EE', label: 'Estland', flag: '🇪🇪' },
  { code: 'FI', label: 'Finnland', flag: '🇫🇮' },
  { code: 'FR', label: 'Frankreich', flag: '🇫🇷' },
  { code: 'DE', label: 'Deutschland', flag: '🇩🇪' },
  { code: 'GR', label: 'Griechenland', flag: '🇬🇷' },
  { code: 'HU', label: 'Ungarn', flag: '🇭🇺' },
  { code: 'IE', label: 'Irland', flag: '🇮🇪' },
  { code: 'IT', label: 'Italien', flag: '🇮🇹' },
  { code: 'LV', label: 'Lettland', flag: '🇱🇻' },
  { code: 'LT', label: 'Litauen', flag: '🇱🇹' },
  { code: 'LU', label: 'Luxemburg', flag: '🇱🇺' },
  { code: 'MT', label: 'Malta', flag: '🇲🇹' },
  { code: 'NL', label: 'Niederlande', flag: '🇳🇱' },
  { code: 'PL', label: 'Polen', flag: '🇵🇱' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', label: 'Rumänien', flag: '🇷🇴' },
  { code: 'SK', label: 'Slowakei', flag: '🇸🇰' },
  { code: 'SI', label: 'Slowenien', flag: '🇸🇮' },
  { code: 'ES', label: 'Spanien', flag: '🇪🇸' },
  { code: 'SE', label: 'Schweden', flag: '🇸🇪' }
];

type CvRequestSummary = {
  id: number;
  firstName: string;
  lastName: string;
  language: string;
  createdAt: string;
};

export default function LetterFormClient() {
  const router = useRouter();
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: cvRequests } = useSWR<CvRequestSummary[]>('/api/cv-requests', fetcher);

  // Target Position
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [jobCountry, setJobCountry] = useState('');
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  // Contact Info
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [useAccountEmail, setUseAccountEmail] = useState(false);

  // Personal Info
  const [experiencesToHighlight, setExperiencesToHighlight] = useState('');
  const [strengths, setStrengths] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Reference to CV
  const [cvRequestId, setCvRequestId] = useState<number | null>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-fill email from account when checkbox is checked
  useEffect(() => {
    if (useAccountEmail && user?.email) {
      setEmail(user.email);
    } else if (!useAccountEmail) {
      setEmail('');
    }
  }, [useAccountEmail, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/letter-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          companyName,
          location,
          jobCountry,
          jobPostingUrl,
          jobDescriptionText,
          phone,
          email,
          experiencesToHighlight,
          strengths,
          additionalNotes,
          cvRequestId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Absenden.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="flex-1 p-4 lg:p-8 bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen flex items-center justify-center">
        <Card className="max-w-2xl mx-auto border-2 shadow-lg">
          <CardContent className="py-16 text-center">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Perfekt!</h2>
            <p className="text-xl font-semibold text-green-600 mb-4">Anschreiben-Anfrage erfolgreich gespeichert!</p>
            <p className="text-gray-700 text-lg max-w-md mx-auto">
              Deine Angaben wurden gespeichert. Wir erstellen dein professionelles Anschreiben und melden uns per E-Mail.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Dein professionelles Anschreiben
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
          Fülle das Formular aus und wir erstellen dein überzeugendes Anschreiben – individuell und zielgerichtet
        </p>

        {/* Credits Display */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-3 inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.letterCredits ?? 0}
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Verfügbare</p>
              <p className="font-semibold text-gray-900">Anschreiben-Credits</p>
            </div>
          </div>
          <Button asChild className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg">
            <Link href="/dashboard/buy">Credits kaufen</Link>
          </Button>
        </div>
      </div>

      {(!user || (user?.letterCredits ?? 0) < 1) && (
        <Card className="mb-6 border-2 bg-orange-50 shadow-lg">
          <CardContent className="py-6 text-center">
            <p className="text-orange-900 font-semibold text-lg mb-2">Keine Credits verfügbar</p>
            <p className="text-orange-800">
              Kaufe jetzt Credits, um dein Anschreiben erstellen zu lassen.{' '}
              <Link href="/dashboard/buy" className="font-bold text-orange-600 underline hover:text-orange-700">
                Jetzt Credits kaufen →
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target Position */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Zielstelle</CardTitle>
            <CardDescription>Informationen zur Position, für die du dich bewirbst</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Jobtitel *</label>
                <input
                  autoComplete="off"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="z.B. Senior Developer"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Firmenname *</label>
                <input
                  autoComplete="off"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ort</label>
                <input
                  autoComplete="off"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="z.B. Berlin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Land</label>
                <select
                  value={jobCountry}
                  onChange={(e) => setJobCountry(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Land auswählen (optional)</option>
                  {EU_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.label}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                  {jobCountry &&
                    !EU_COUNTRIES.some((c) => c.label === jobCountry) && (
                      <option value={jobCountry}>{jobCountry}</option>
                    )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Link zur Stellenanzeige (optional)</label>
              <input
                  autoComplete="off"
                type="url"
                value={jobPostingUrl}
                onChange={(e) => setJobPostingUrl(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stellenbeschreibung</label>
              <textarea
                  autoComplete="off"
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={8}
                placeholder="Kopiere hier die komplette Stellenbeschreibung ein..."
              />
              <p className="text-xs text-gray-500">
                Tipp: Je detaillierter die Stellenbeschreibung, desto besser können wir dein Anschreiben darauf zuschneiden.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Kontaktdaten</CardTitle>
            <CardDescription>
              Deine Kontaktinformationen für das Anschreiben
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon *</label>
                <input
                  autoComplete="off"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="+49 ..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">E-Mail *</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  autoComplete="off"
                  type="checkbox"
                  id="useAccountEmailLetter"
                  checked={useAccountEmail}
                  onChange={(e) => setUseAccountEmail(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="useAccountEmailLetter" className="text-sm text-gray-700 cursor-pointer">
                  E-Mail-Adresse meines Kontos verwenden ({user?.email})
                </label>
              </div>
              <input
                  autoComplete="off"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={useAccountEmail}
                required={!useAccountEmail}
                placeholder={useAccountEmail ? user?.email : 'ihre.email@beispiel.de'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Info for Letter */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Persönliche Informationen für das Anschreiben</CardTitle>
            <CardDescription>
              Welche deiner Erfahrungen und Stärken sollen im Anschreiben betont werden?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Erfahrungen / Projekte, die betont werden sollen</label>
              <textarea
                  autoComplete="off"
                value={experiencesToHighlight}
                onChange={(e) => setExperiencesToHighlight(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={5}
                placeholder="z.B. Welche konkreten Projekte, Erfolge oder Erfahrungen passen besonders gut zur Stelle?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Besondere Stärken / Relevante Fähigkeiten</label>
              <textarea
                  autoComplete="off"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={4}
                placeholder="z.B. Technische Skills, Soft Skills, die für diese Position wichtig sind..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zusätzliche Hinweise (optional)</label>
              <textarea
                  autoComplete="off"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="z.B. Geplanter Umzug, Gehaltsvorstellung, besondere Motivation für diese Firma..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Reference to existing CV */}
        {cvRequests && cvRequests.length > 0 && (
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Referenz zu einem bestehenden Lebenslauf (optional)</CardTitle>
              <CardDescription>
                Falls wir auf einen deiner bereits erstellten Lebensläufe Bezug nehmen sollen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bestehender Lebenslauf</label>
                <select
                  value={cvRequestId ?? ''}
                  onChange={(e) => setCvRequestId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Keiner ausgewählt</option>
                  {cvRequests.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.firstName} {cv.lastName} - {cv.language} (
                      {new Date(cv.createdAt).toLocaleDateString('de-DE')})
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {error && (
          <Card className="border-2 bg-red-50 shadow-lg">
            <CardContent className="py-6 text-center">
              <p className="text-red-900 font-semibold text-lg">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4 pb-8">
          <Button type="button" variant="outline" asChild className="rounded-full px-8">
            <Link href="/dashboard">Zurück</Link>
          </Button>
          <Button
            type="submit"
            disabled={loading || (user?.letterCredits ?? 0) < 1}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-12 py-6 text-lg font-semibold shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Wird gespeichert...
              </span>
            ) : (
              'Anfrage absenden'
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
