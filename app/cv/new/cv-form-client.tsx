'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/lib/db/schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

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

type WorkExperience = {
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
};

type VolunteerWork = {
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export default function CvFormClient() {
  const router = useRouter();
  const { data: user } = useSWR<User>('/api/user', fetcher);

  // Personal Data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [useAccountEmail, setUseAccountEmail] = useState(false);

  // Address
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [prefillError, setPrefillError] = useState('');

  // Work Experience (dynamic)
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    { jobTitle: '', employer: '', location: '', startDate: '', endDate: '', description: '' }
  ]);

  // Education (dynamic)
  const [education, setEducation] = useState<Education[]>([
    { degree: '', institution: '', location: '', startDate: '', endDate: '' }
  ]);

  // Volunteer Work (dynamic)
  const [volunteerWork, setVolunteerWork] = useState<VolunteerWork[]>([
    { organization: '', role: '', location: '', startDate: '', endDate: '', description: '' }
  ]);

  // Skills
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [softSkills, setSoftSkills] = useState('');
  const [languages, setLanguages] = useState('');

  // Other
  const [certificates, setCertificates] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [availability, setAvailability] = useState('');

  // Photo
  const [photoPath, setPhotoPath] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  // Optional
  const [jobDescription, setJobDescription] = useState('');
  const [language, setLanguage] = useState<'Deutsch' | 'Englisch'>('Deutsch');

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [consentCvData, setConsentCvData] = useState(false);
  const [showPhotoConsent, setShowPhotoConsent] = useState(false);
  const [photoConsentGiven, setPhotoConsentGiven] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill email from account when checkbox is checked
  useEffect(() => {
    if (useAccountEmail && user?.email) {
      setEmail(user.email);
    } else if (!useAccountEmail) {
      setEmail('');
    }
  }, [useAccountEmail, user?.email]);

  // Load draft from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || draftLoaded) return;

    try {
      const savedDraft = sessionStorage.getItem('cv-form-draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        // Restore all form fields from draft
        if (draft.firstName) setFirstName(draft.firstName);
        if (draft.lastName) setLastName(draft.lastName);
        if (draft.birthDate) setBirthDate(draft.birthDate);
        if (draft.phone) setPhone(draft.phone);
        if (draft.email) setEmail(draft.email);
        if (draft.street) setStreet(draft.street);
        if (draft.houseNumber) setHouseNumber(draft.houseNumber);
        if (draft.zipCode) setZipCode(draft.zipCode);
        if (draft.city) setCity(draft.city);
        if (draft.country) setCountry(draft.country);
        if (draft.workExperience) setWorkExperience(draft.workExperience);
        if (draft.education) setEducation(draft.education);
        if (draft.volunteerWork) setVolunteerWork(draft.volunteerWork);
        if (draft.technicalSkills) setTechnicalSkills(draft.technicalSkills);
        if (draft.softSkills) setSoftSkills(draft.softSkills);
        if (draft.languages) setLanguages(draft.languages);
        if (draft.certificates) setCertificates(draft.certificates);
        if (draft.driverLicense) setDriverLicense(draft.driverLicense);
        if (draft.availability) setAvailability(draft.availability);
        if (draft.photoPath) setPhotoPath(draft.photoPath);
        if (draft.jobDescription) setJobDescription(draft.jobDescription);
        if (draft.language) setLanguage(draft.language);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
    setDraftLoaded(true);
  }, [draftLoaded]);

  // Auto-save draft to sessionStorage
  useEffect(() => {
    if (!draftLoaded || typeof window === 'undefined') return;

    const draft = {
      firstName,
      lastName,
      birthDate,
      phone,
      email,
      street,
      houseNumber,
      zipCode,
      city,
      country,
      workExperience,
      education,
      volunteerWork,
      technicalSkills,
      softSkills,
      languages,
      certificates,
      driverLicense,
      availability,
      photoPath,
      jobDescription,
      language
    };

    try {
      sessionStorage.setItem('cv-form-draft', JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  }, [
    draftLoaded,
    firstName,
    lastName,
    birthDate,
    phone,
    email,
    street,
    houseNumber,
    zipCode,
    city,
    country,
    workExperience,
    education,
    volunteerWork,
    technicalSkills,
    softSkills,
    languages,
    certificates,
    driverLicense,
    availability,
    photoPath,
    jobDescription,
    language
  ]);

  const clearDraft = () => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('cv-form-draft');
      // Reset form to initial state
      setFirstName('');
      setLastName('');
      setBirthDate('');
      setPhone('');
      setEmail('');
      setStreet('');
      setHouseNumber('');
      setZipCode('');
      setCity('');
      setCountry('');
      setWorkExperience([{ jobTitle: '', employer: '', location: '', startDate: '', endDate: '', description: '' }]);
      setEducation([{ degree: '', institution: '', location: '', startDate: '', endDate: '' }]);
      setVolunteerWork([{ organization: '', role: '', location: '', startDate: '', endDate: '', description: '' }]);
      setTechnicalSkills('');
      setSoftSkills('');
      setLanguages('');
      setCertificates('');
      setDriverLicense('');
      setAvailability('');
      setPhotoPath('');
      setJobDescription('');
      setLanguage('Deutsch');
      setConsentCvData(false);
      setPhotoConsentGiven(false);
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  };

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience,
      { jobTitle: '', employer: '', location: '', startDate: '', endDate: '', description: '' }
    ]);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...workExperience];
    updated[index][field] = value;
    setWorkExperience(updated);
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', location: '', startDate: '', endDate: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const addVolunteerWork = () => {
    setVolunteerWork([
      ...volunteerWork,
      { organization: '', role: '', location: '', startDate: '', endDate: '', description: '' }
    ]);
  };

  const removeVolunteerWork = (index: number) => {
    setVolunteerWork(volunteerWork.filter((_, i) => i !== index));
  };

  const updateVolunteerWork = (index: number, field: keyof VolunteerWork, value: string) => {
    const updated = [...volunteerWork];
    updated[index][field] = value;
    setVolunteerWork(updated);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload fehlgeschlagen');
      }

      setPhotoPath(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hochladen');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePrefillFromAccount = () => {
    if (!user) {
      setPrefillError('Bitte zuerst anmelden, um Account-Daten zu übernehmen.');
      return;
    }
    setPrefillError('');
    const rawBirthDate = user.birthDate as unknown;
    const birthDateValue =
      rawBirthDate instanceof Date
        ? rawBirthDate.toISOString().split('T')[0]
        : typeof rawBirthDate === 'string' && rawBirthDate
          ? rawBirthDate.split('T')[0]
          : '';

    setFirstName(user.firstName || firstName);
    setLastName(user.lastName || lastName);
    setBirthDate(birthDateValue || birthDate);
    setUseAccountEmail(true);
    setEmail(user.email || email);
    setStreet(user.street || street);
    setHouseNumber(user.houseNumber || houseNumber);
    setZipCode(user.zipCode || zipCode);
    setCity(user.city || city);
    setCountry(user.country || country);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!consentCvData) {
      setError('Bitte bestätige die Einwilligung zur Verarbeitung deiner Daten.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/cv-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate,
          phone,
          email,
          street,
          houseNumber,
          zipCode,
          city,
          country,
          workExperience,
          education,
          skills: {
            technical: technicalSkills,
            soft: softSkills,
            languages
          },
          other: {
            certificates,
            driverLicense,
            availability,
            volunteerWork
          },
          photoPath,
          jobDescription,
          language
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Absenden.');
      }

      // Clear draft on successful submission
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cv-form-draft');
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
            <p className="text-xl font-semibold text-green-600 mb-4">Anfrage erfolgreich gespeichert!</p>
            <p className="text-gray-700 text-lg max-w-md mx-auto">
              Deine Angaben wurden gespeichert. Wir erstellen deinen professionellen Lebenslauf und melden uns per E-Mail.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      {/* Hero Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Dein professioneller Lebenslauf
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
          Fülle das Formular aus und wir erstellen deinen optimierten Lebenslauf – individuell und professionell
        </p>

        {/* Credits Display */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-3 inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.cvCredits ?? 0}
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Verfügbare</p>
              <p className="font-semibold text-gray-900">CV-Credits</p>
            </div>
          </div>
          <Button asChild className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg">
            <Link href="/dashboard/buy">Credits kaufen</Link>
          </Button>
        </div>
      </div>
      <Alert className="mb-6 max-w-3xl mx-auto">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-orange-600 mt-0.5" />
          <AlertDescription>
            Ihr Entwurf wird temporär in Ihrem Browser gespeichert und automatisch beim Schließen des Tabs gelöscht.
          </AlertDescription>
        </div>
      </Alert>
      {prefillError && (
        <div className="mb-4 max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {prefillError}
        </div>
      )}

      {(!user || (user?.cvCredits ?? 0) < 1) && (
        <Card className="mb-6 border-2 bg-orange-50 shadow-lg">
          <CardContent className="py-6 text-center">
            <p className="text-orange-900 font-semibold text-lg mb-2">Keine Credits verfügbar</p>
            <p className="text-orange-800">
              Kaufe jetzt Credits, um deinen Lebenslauf erstellen zu lassen.{' '}
              <Link href="/dashboard/buy" className="font-bold text-orange-600 underline hover:text-orange-700">
                Jetzt Credits kaufen →
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrefillFromAccount}
            className="rounded-full"
            disabled={!user}
          >
            Daten aus Account übernehmen
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearDraft}
            className="rounded-full border-red-300 text-red-700 hover:bg-red-50"
          >
            Entwurf löschen
          </Button>
          {!user && (
            <p className="text-sm text-gray-500">Bitte einloggen, um Account-Daten zu nutzen.</p>
          )}
        </div>
        {/* Personal Data */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Persönliche Daten</CardTitle>
            <CardDescription>Grundlegende Informationen für deinen Lebenslauf</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vorname *</label>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nachname *</label>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Geburtsdatum</label>
                <input
                  type="date"
                  autoComplete="bday"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon *</label>
                <input
                  type="tel"
                  autoComplete="tel"
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
                  id="useAccountEmail"
                  checked={useAccountEmail}
                  onChange={(e) => setUseAccountEmail(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="useAccountEmail" className="text-sm text-gray-700 cursor-pointer">
                  E-Mail-Adresse meines Kontos verwenden ({user?.email})
                </label>
              </div>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={useAccountEmail}
                required={!useAccountEmail}
                placeholder={useAccountEmail ? user?.email : 'ihre.email@beispiel.de'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
            <CardDescription>Deine Kontaktadresse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-medium">Straße</label>
                <input
                  type="text"
                  autoComplete="address-line1"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hausnummer</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PLZ</label>
                  <input
                    type="text"
                  autoComplete="postal-code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ort</label>
                <input
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Land</label>
                  <select
                    autoComplete="country-name"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Land auswählen (optional)</option>
                    {EU_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.label}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                    {country && !EU_COUNTRIES.some((c) => c.label === country) && (
                      <option value={country}>{country}</option>
                    )}
                  </select>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Berufserfahrung</CardTitle>
                <CardDescription>Füge deine bisherigen Positionen hinzu</CardDescription>
              </div>
              <Button type="button" onClick={addWorkExperience} size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4" />
                Hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {workExperience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                {workExperience.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeWorkExperience(index)}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jobtitel</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => updateWorkExperience(index, 'jobTitle', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Arbeitgeber</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={exp.employer}
                      onChange={(e) => updateWorkExperience(index, 'employer', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ort</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Von</label>
                    <input
                  autoComplete="off"
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bis</label>
                    <input
                  autoComplete="off"
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                      placeholder="leer = heute"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tätigkeitsbeschreibung / Bulletpoints</label>
                  <textarea
                  autoComplete="off"
                    value={exp.description}
                    onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    rows={4}
                    placeholder="• Hauptaufgabe 1&#10;• Hauptaufgabe 2&#10;• Erfolg / Ergebnis"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ausbildung</CardTitle>
                <CardDescription>Schulische und akademische Ausbildung</CardDescription>
              </div>
              <Button type="button" onClick={addEducation} size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4" />
                Hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                {education.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeEducation(index)}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Abschluss</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                      placeholder="z.B. Bachelor of Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Schule / Hochschule</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ort</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={edu.location}
                      onChange={(e) => updateEducation(index, 'location', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Von</label>
                    <input
                  autoComplete="off"
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bis</label>
                    <input
                  autoComplete="off"
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Volunteer Work / Engagements */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ehrenämter & Engagements</CardTitle>
                <CardDescription>Freiwillige Tätigkeiten und soziales Engagement</CardDescription>
              </div>
              <Button type="button" onClick={addVolunteerWork} size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4" />
                Hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {volunteerWork.map((vol, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                {volunteerWork.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVolunteerWork(index)}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organisation / Verein</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={vol.organization}
                      onChange={(e) => updateVolunteerWork(index, 'organization', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                      placeholder="z.B. Rotes Kreuz, UNICEF"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rolle / Position</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={vol.role}
                      onChange={(e) => updateVolunteerWork(index, 'role', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                      placeholder="z.B. Vorstandsmitglied, Freiwilliger"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ort</label>
                    <input
                  autoComplete="off"
                      type="text"
                      value={vol.location}
                      onChange={(e) => updateVolunteerWork(index, 'location', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Von</label>
                    <input
                  autoComplete="off"
                      type="month"
                      value={vol.startDate}
                      onChange={(e) => updateVolunteerWork(index, 'startDate', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bis</label>
                    <input
                  autoComplete="off"
                      type="month"
                      value={vol.endDate}
                      onChange={(e) => updateVolunteerWork(index, 'endDate', e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                      placeholder="leer = aktuell"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tätigkeitsbeschreibung</label>
                  <textarea
                  autoComplete="off"
                    value={vol.description}
                    onChange={(e) => updateVolunteerWork(index, 'description', e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Beschreibe deine Aufgaben und Erfolge in diesem Engagement..."
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Kenntnisse & Fähigkeiten</CardTitle>
            <CardDescription>Deine beruflichen und persönlichen Kompetenzen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Technische Skills</label>
              <textarea
                  autoComplete="off"
                value={technicalSkills}
                onChange={(e) => setTechnicalSkills(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="z.B. Python, React, SQL, Photoshop..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Soft Skills</label>
              <textarea
                  autoComplete="off"
                value={softSkills}
                onChange={(e) => setSoftSkills(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="z.B. Teamfähigkeit, Projektmanagement..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sprachen</label>
              <textarea
                  autoComplete="off"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={2}
                placeholder="z.B. Deutsch (Muttersprache), Englisch (fließend), Spanisch (Grundkenntnisse)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Other */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Sonstiges</CardTitle>
            <CardDescription>Weitere relevante Informationen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Zertifikate</label>
              <textarea
                  autoComplete="off"
                value={certificates}
                onChange={(e) => setCertificates(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={2}
                placeholder="z.B. AWS Certified, Scrum Master..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Führerschein</label>
                <input
                  autoComplete="off"
                  type="text"
                  value={driverLicense}
                  onChange={(e) => setDriverLicense(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="z.B. Klasse B"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Verfügbarkeit / Eintrittsdatum</label>
                <input
                  autoComplete="off"
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  placeholder="z.B. ab sofort, ab 01.06.2025"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={showPhotoConsent}
          onOpenChange={(open: boolean) => {
            setShowPhotoConsent(open);
            if (!open && !photoConsentGiven) {
              setPhotoConsentGiven(false);
            }
          }}
        >
          <DialogContent onClose={() => {
            setShowPhotoConsent(false);
            setPhotoConsentGiven(false);
          }}>
            <DialogHeader>
              <DialogTitle>Einwilligung Foto-Upload</DialogTitle>
              <DialogDescription>
                Fotos enthalten biometrische Daten (Art. 9 DSGVO). Wir verarbeiten das Foto nur zur Erstellung deines Lebenslaufs.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-2">
              <Checkbox
                id="photoConsent"
                checked={photoConsentGiven}
                onChange={(e) => setPhotoConsentGiven(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="photoConsent" className="text-sm text-gray-700 leading-relaxed">
                Ich willige in die Verarbeitung meines Fotos ein.
              </Label>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPhotoConsentGiven(false);
                  setShowPhotoConsent(false);
                }}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!photoConsentGiven) return;
                  setShowPhotoConsent(false);
                  setTimeout(() => fileInputRef.current?.click(), 0);
                }}
                disabled={!photoConsentGiven}
              >
                Zustimmen und Foto hochladen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Photo Upload */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Bewerbungsfoto (optional)</CardTitle>
            <CardDescription>Lade ein professionelles Bewerbungsfoto hoch (JPG/PNG, max. 5MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label
                className="cursor-pointer"
                onClick={(e) => {
                  if (!photoConsentGiven) {
                    e.preventDefault();
                    setShowPhotoConsent(true);
                  }
                }}
              >
                <div className="flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{photoPath ? 'Anderes Foto wählen' : 'Foto hochladen'}</span>
                </div>
                <input
                  autoComplete="off"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={!photoConsentGiven || photoUploading}
                  ref={fileInputRef}
                />
              </label>

              {photoUploading && <span className="text-sm text-gray-500">Wird hochgeladen...</span>}

              {photoPath && !photoUploading && (
                <div className="flex items-center gap-2">
                  <img src={photoPath} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                  <span className="text-sm text-green-600">✓ Hochgeladen</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Optional: Job Description */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Stellenbeschreibung (optional)</CardTitle>
            <CardDescription>Falls du deinen Lebenslauf für eine spezifische Stelle zuschneiden möchtest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stellenbeschreibung</label>
              <textarea
                  autoComplete="off"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                rows={6}
                placeholder="Kopiere hier die komplette Stellenbeschreibung ein..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sprache des Lebenslaufs</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'Deutsch' | 'Englisch')}
                className="border border-input rounded-md px-3 py-2 text-sm"
              >
                <option value="Deutsch">Deutsch</option>
                <option value="Englisch">Englisch</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="col-span-2 space-y-3 border-t pt-6">
          <div className="flex items-start gap-2">
            <Checkbox
              id="consentCvData"
              checked={consentCvData}
              onChange={(e) => setConsentCvData(e.target.checked)}
              required
              className="mt-1"
            />
            <Label htmlFor="consentCvData" className="text-sm text-gray-700 leading-relaxed">
              Ich willige ein, dass meine personenbezogenen Daten (inkl. Lebenslauf, Arbeitszeugnisse, Qualifikationen)
              zur Erstellung meines optimierten Lebenslaufs verarbeitet werden. Die Daten werden nach Bearbeitung meiner
              Anfrage für 90 Tage gespeichert und dann automatisch gelöscht.{' '}
              <Link href="/datenschutz" className="text-orange-600 underline">
                Datenschutzerklärung
              </Link>
            </Label>
          </div>
        </div>

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
            disabled={loading || (user?.cvCredits ?? 0) < 1 || photoUploading || !consentCvData}
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
