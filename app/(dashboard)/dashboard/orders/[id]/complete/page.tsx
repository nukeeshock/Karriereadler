'use client';

import { use, useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Order = {
  id: number;
  productType: 'CV' | 'COVER_LETTER' | 'BUNDLE';
  status: string;
  customerName: string | null;
  customerEmail: string;
  basicInfo: any;
};

type WorkExperience = {
  company: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
  responsibilities: string;
};

type Education = {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description: string;
};

type VoluntaryWork = {
  organization: string;
  role: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
  description: string;
};

export default function CompleteOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data, error, isLoading } = useSWR<{ order: Order }>(
    `/api/orders/${resolvedParams.id}`,
    fetcher
  );

  // CV Fields
  const [jobDescription, setJobDescription] = useState('');
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([{
    company: '',
    position: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false,
    responsibilities: ''
  }]);
  const [educationEntries, setEducationEntries] = useState<Education[]>([{
    institution: '',
    degree: '',
    field: '',
    startYear: '',
    endYear: '',
    description: ''
  }]);
  const [voluntaryWork, setVoluntaryWork] = useState<VoluntaryWork[]>([{
    organization: '',
    role: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    isCurrent: false,
    description: ''
  }]);
  const [skills, setSkills] = useState('');
  const [additionalCvInfo, setAdditionalCvInfo] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Cover Letter Fields
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobPostingUrl, setJobPostingUrl] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [experiencesToHighlight, setExperiencesToHighlight] = useState('');
  const [strengths, setStrengths] = useState('');
  const [additionalLetterInfo, setAdditionalLetterInfo] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const order = data?.order;

  useEffect(() => {
    if (order && order.status !== 'PAID') {
      router.push('/dashboard/orders');
    }
  }, [order, router]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Lade Auftrag...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Auftrag nicht gefunden</h2>
              <p className="text-gray-600 mb-6">
                Der Auftrag konnte nicht geladen werden oder du hast keine Berechtigung.
              </p>
              <Button onClick={() => router.push('/dashboard/orders')}>
                Zurück zur Übersicht
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Fragebogen erfolgreich eingereicht!
              </h2>
              <p className="text-gray-600 mb-6">
                Vielen Dank! Wir haben alle Informationen erhalten und beginnen nun mit der Erstellung
                deiner Bewerbungsunterlagen. Du erhältst die fertigen Dokumente in 2-3 Werktagen per E-Mail.
              </p>
              <Button onClick={() => router.push('/dashboard/orders')}>
                Zurück zur Übersicht
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData: any = {};

      // Add fields based on productType
      if (order.productType === 'CV' || order.productType === 'BUNDLE') {
        formData.cv = {
          jobDescription,
          workExperience: JSON.stringify(workExperiences),
          education: JSON.stringify(educationEntries),
          voluntaryWork: JSON.stringify(voluntaryWork),
          skills,
          linkedinUrl: linkedinUrl || null,
          resumePath: resumePath || null,
          additionalInfo: additionalCvInfo
        };
      }

      if (order.productType === 'COVER_LETTER' || order.productType === 'BUNDLE') {
        formData.coverLetter = {
          jobTitle,
          companyName,
          jobPostingUrl,
          jobDescriptionText,
          experiencesToHighlight,
          strengths,
          additionalInfo: additionalLetterInfo
        };
      }

      const res = await fetch(`/api/orders/${order.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Fehler beim Einreichen des Fragebogens');
      }

      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setSubmitting(false);
    }
  };

  const showCvForm = order.productType === 'CV' || order.productType === 'BUNDLE';
  const showLetterForm = order.productType === 'COVER_LETTER' || order.productType === 'BUNDLE';

  const productLabels: Record<string, string> = {
    CV: 'Lebenslauf',
    COVER_LETTER: 'Anschreiben',
    BUNDLE: 'Komplett-Bundle (Lebenslauf + Anschreiben)'
  };

  // Work Experience Handlers
  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, {
      company: '',
      position: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isCurrent: false,
      responsibilities: ''
    }]);
  };

  const removeWorkExperience = (index: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperiences(updated);
  };

  // Education Handlers
  const addEducation = () => {
    setEducationEntries([...educationEntries, {
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      description: ''
    }]);
  };

  const removeEducation = (index: number) => {
    if (educationEntries.length > 1) {
      setEducationEntries(educationEntries.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educationEntries];
    updated[index] = { ...updated[index], [field]: value };
    setEducationEntries(updated);
  };

  // Voluntary Work Handlers
  const addVoluntaryWork = () => {
    setVoluntaryWork([...voluntaryWork, {
      organization: '',
      role: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isCurrent: false,
      description: ''
    }]);
  };

  const removeVoluntaryWork = (index: number) => {
    if (voluntaryWork.length > 1) {
      setVoluntaryWork(voluntaryWork.filter((_, i) => i !== index));
    }
  };

  const updateVoluntaryWork = (index: number, field: keyof VoluntaryWork, value: string | boolean) => {
    const updated = [...voluntaryWork];
    updated[index] = { ...updated[index], [field]: value };
    setVoluntaryWork(updated);
  };

  const handleResumeUpload = async (file: File | null) => {
    if (!file) return;
    setResumeError(null);
    setResumeUploading(true);

    try {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setResumeError('Datei ist zu groß. Bitte max. 10MB hochladen.');
        setResumeUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload fehlgeschlagen');
      }

      setResumePath(data.path);
      setResumeFileName(file.name);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
      setResumePath(null);
      setResumeFileName(null);
    } finally {
      setResumeUploading(false);
    }
  };

  // Month options
  const months = [
    { value: '01', label: 'Januar' },
    { value: '02', label: 'Februar' },
    { value: '03', label: 'März' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Dezember' }
  ];

  return (
    <div className="flex-1 min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fragebogen ausfüllen</h1>
          <p className="text-gray-600">
            Produkt: <strong>{productLabels[order.productType]}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Bitte fülle alle Felder sorgfältig aus. Diese Informationen helfen uns, deine
            Bewerbungsunterlagen optimal zu erstellen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Form */}
          {showCvForm && (
            <Card>
              <CardHeader>
                <CardTitle>Lebenslauf-Informationen</CardTitle>
                <CardDescription>
                  Angaben für die Erstellung deines professionellen Lebenslaufs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobDescription">
                    Zielposition / Jobbeschreibung *
                  </Label>
                  <Textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Beschreibe die Position, auf die du dich bewirbst, oder füge die Stellenausschreibung ein..."
                    rows={4}
                    required
                  />
                </div>

                {/* Work Experience - Dynamic Fields */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">
                      Berufserfahrung *
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Füge alle relevanten beruflichen Stationen hinzu
                    </p>
                  </div>

                  {workExperiences.map((exp, index) => (
                    <Card key={index} className="border-orange-200 bg-orange-50/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Position {index + 1}
                          </h4>
                          {workExperiences.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWorkExperience(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Entfernen
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`company-${index}`}>Firmenname *</Label>
                            <Input
                              id={`company-${index}`}
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                              placeholder="z.B. Acme GmbH"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`position-${index}`}>Position / Rolle *</Label>
                            <Input
                              id={`position-${index}`}
                              value={exp.position}
                              onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                              placeholder="z.B. Senior Developer"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Von *</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={exp.startMonth}
                                onChange={(e) => updateWorkExperience(index, 'startMonth', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                required
                              >
                                <option value="">Monat</option>
                                {months.map(m => (
                                  <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                              </select>
                              <Input
                                type="number"
                                value={exp.startYear}
                                onChange={(e) => updateWorkExperience(index, 'startYear', e.target.value)}
                                placeholder="Jahr"
                                min="1950"
                                max="2100"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Bis *</Label>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={exp.endMonth}
                                  onChange={(e) => updateWorkExperience(index, 'endMonth', e.target.value)}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  required={!exp.isCurrent}
                                  disabled={exp.isCurrent}
                                >
                                  <option value="">Monat</option>
                                  {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                  ))}
                                </select>
                                <Input
                                  type="number"
                                  value={exp.endYear}
                                  onChange={(e) => updateWorkExperience(index, 'endYear', e.target.value)}
                                  placeholder="Jahr"
                                  min="1950"
                                  max="2100"
                                  required={!exp.isCurrent}
                                  disabled={exp.isCurrent}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`current-${index}`}
                                  checked={exp.isCurrent}
                                  onChange={(e) => updateWorkExperience(index, 'isCurrent', e.target.checked)}
                                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor={`current-${index}`} className="text-sm text-gray-700">
                                  Aktuell
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`responsibilities-${index}`}>
                            Tätigkeiten & Erfolge *
                          </Label>
                          <Textarea
                            id={`responsibilities-${index}`}
                            value={exp.responsibilities}
                            onChange={(e) => updateWorkExperience(index, 'responsibilities', e.target.value)}
                            placeholder="Beschreibe deine Hauptaufgaben, Verantwortlichkeiten und Erfolge..."
                            rows={4}
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addWorkExperience}
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Weitere Position hinzufügen
                  </Button>
                </div>

                {/* Education - Dynamic Fields */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">
                      Ausbildung / Studium *
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Füge alle relevanten Bildungsabschlüsse hinzu
                    </p>
                  </div>

                  {educationEntries.map((edu, index) => (
                    <Card key={index} className="border-orange-200 bg-orange-50/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Abschluss {index + 1}
                          </h4>
                          {educationEntries.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Entfernen
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`institution-${index}`}>Bildungseinrichtung *</Label>
                          <Input
                            id={`institution-${index}`}
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="z.B. Universität München"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`degree-${index}`}>Abschluss *</Label>
                            <Input
                              id={`degree-${index}`}
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              placeholder="z.B. Bachelor of Science"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`field-${index}`}>Fachrichtung *</Label>
                            <Input
                              id={`field-${index}`}
                              value={edu.field}
                              onChange={(e) => updateEducation(index, 'field', e.target.value)}
                              placeholder="z.B. Informatik"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`startYear-${index}`}>Von Jahr *</Label>
                            <Input
                              id={`startYear-${index}`}
                              type="number"
                              value={edu.startYear}
                              onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                              placeholder="2018"
                              min="1950"
                              max="2100"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`endYear-${index}`}>Bis Jahr *</Label>
                            <Input
                              id={`endYear-${index}`}
                              type="number"
                              value={edu.endYear}
                              onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                              placeholder="2022"
                              min="1950"
                              max="2100"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`description-${index}`}>
                            Beschreibung
                          </Label>
                          <Textarea
                            id={`description-${index}`}
                            value={edu.description}
                            onChange={(e) => updateEducation(index, 'description', e.target.value)}
                            placeholder="Schwerpunkte, besondere Leistungen, Abschlussnote..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEducation}
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Weiteren Abschluss hinzufügen
                  </Button>
                </div>

                {/* Voluntary Work - Dynamic Fields */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">
                      Engagements & Ehrenämter
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Falls vorhanden, gib hier deine ehrenamtlichen Tätigkeiten, Vereinsmitgliedschaften oder soziales Engagement an.
                    </p>
                  </div>

                  {voluntaryWork.map((vol, index) => (
                    <Card key={index} className="border-orange-200 bg-orange-50/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Engagement {index + 1}
                          </h4>
                          {voluntaryWork.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVoluntaryWork(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Entfernen
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`organization-${index}`}>Organisation</Label>
                            <Input
                              id={`organization-${index}`}
                              value={vol.organization}
                              onChange={(e) => updateVoluntaryWork(index, 'organization', e.target.value)}
                              placeholder="z.B. Rotes Kreuz"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`role-${index}`}>Rolle / Position</Label>
                            <Input
                              id={`role-${index}`}
                              value={vol.role}
                              onChange={(e) => updateVoluntaryWork(index, 'role', e.target.value)}
                              placeholder="z.B. Teamleiter"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Von</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={vol.startMonth}
                                onChange={(e) => updateVoluntaryWork(index, 'startMonth', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <option value="">Monat</option>
                                {months.map(m => (
                                  <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                              </select>
                              <Input
                                type="number"
                                value={vol.startYear}
                                onChange={(e) => updateVoluntaryWork(index, 'startYear', e.target.value)}
                                placeholder="Jahr"
                                min="1950"
                                max="2100"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Bis</Label>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={vol.endMonth}
                                  onChange={(e) => updateVoluntaryWork(index, 'endMonth', e.target.value)}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  disabled={vol.isCurrent}
                                >
                                  <option value="">Monat</option>
                                  {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                  ))}
                                </select>
                                <Input
                                  type="number"
                                  value={vol.endYear}
                                  onChange={(e) => updateVoluntaryWork(index, 'endYear', e.target.value)}
                                  placeholder="Jahr"
                                  min="1950"
                                  max="2100"
                                  disabled={vol.isCurrent}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`voluntary-current-${index}`}
                                  checked={vol.isCurrent}
                                  onChange={(e) => updateVoluntaryWork(index, 'isCurrent', e.target.checked)}
                                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor={`voluntary-current-${index}`} className="text-sm text-gray-700">
                                  Aktuell
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`voluntary-description-${index}`}>
                            Beschreibung der Tätigkeiten
                          </Label>
                          <Textarea
                            id={`voluntary-description-${index}`}
                            value={vol.description}
                            onChange={(e) => updateVoluntaryWork(index, 'description', e.target.value)}
                            placeholder="Beschreibe deine Aufgaben und Aktivitäten..."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVoluntaryWork}
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Weiteres Engagement hinzufügen
                  </Button>
                </div>

                <div>
                  <Label htmlFor="skills">
                    Fähigkeiten & Kenntnisse *
                  </Label>
                  <Textarea
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Fachliche Kenntnisse, Softwarekenntnisse, Sprachen, Zertifikate..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">
                    LinkedIn-Profil
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="linkedin.com/in/deinprofil oder https://www.linkedin.com/in/deinprofil"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hilft uns, deine Laufbahn und Referenzen direkt abzugleichen.
                  </p>
                </div>

                <div>
                  <Label htmlFor="resumeUpload">
                    Aktueller Lebenslauf hochladen
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Input
                      id="resumeUpload"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                      disabled={resumeUploading}
                    />
                    {resumeUploading && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Upload läuft...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF oder DOCX, max. 10MB. Wir orientieren uns daran, was bereits gut funktioniert.
                  </p>
                  {resumeFileName && resumePath && (
                    <p className="text-sm text-green-700 mt-1">
                      Datei gespeichert: {resumeFileName}
                    </p>
                  )}
                  {resumeError && (
                    <p className="text-sm text-red-600 mt-1">
                      {resumeError}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additionalCvInfo">
                    Zusätzliche Informationen
                  </Label>
                  <Textarea
                    id="additionalCvInfo"
                    value={additionalCvInfo}
                    onChange={(e) => setAdditionalCvInfo(e.target.value)}
                    placeholder="Ehrenamtliche Tätigkeiten, Hobbys, Führerschein, besondere Auszeichnungen..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cover Letter Form */}
          {showLetterForm && (
            <Card>
              <CardHeader>
                <CardTitle>Anschreiben-Informationen</CardTitle>
                <CardDescription>
                  Angaben für die Erstellung deines individuellen Anschreibens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Ziel-Position *</Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="z.B. Marketing Manager"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Firma *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="z.B. Acme GmbH"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="jobPostingUrl">
                    Link zur Stellenanzeige
                  </Label>
                  <Input
                    id="jobPostingUrl"
                    type="text"
                    value={jobPostingUrl}
                    onChange={(e) => setJobPostingUrl(e.target.value)}
                    placeholder="z.B. https://jobs.example.com/position oder linkedin.com/jobs/..."
                  />
                </div>

                <div>
                  <Label htmlFor="jobDescriptionText">
                    Stellenbeschreibung / Anforderungen *
                  </Label>
                  <Textarea
                    id="jobDescriptionText"
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    placeholder="Füge die Stellenbeschreibung oder wichtige Anforderungen ein..."
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experiencesToHighlight">
                    Welche Erfahrungen möchtest du hervorheben? *
                  </Label>
                  <Textarea
                    id="experiencesToHighlight"
                    value={experiencesToHighlight}
                    onChange={(e) => setExperiencesToHighlight(e.target.value)}
                    placeholder="Beschreibe relevante Erfahrungen, Projekte oder Erfolge, die du im Anschreiben betonen möchtest..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="strengths">
                    Deine Stärken *
                  </Label>
                  <Textarea
                    id="strengths"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Was sind deine persönlichen und fachlichen Stärken?"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="additionalLetterInfo">
                    Zusätzliche Hinweise
                  </Label>
                  <Textarea
                    id="additionalLetterInfo"
                    value={additionalLetterInfo}
                    onChange={(e) => setAdditionalLetterInfo(e.target.value)}
                    placeholder="Besondere Wünsche, Ton des Anschreibens, sonstige Hinweise..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600">{submitError}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/orders')}
              disabled={submitting}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird eingereicht...
                </>
              ) : (
                'Fragebogen absenden'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Nach dem Absenden beginnen wir sofort mit der Erstellung deiner Unterlagen.
          </p>
        </form>
      </div>
    </div>
  );
}
