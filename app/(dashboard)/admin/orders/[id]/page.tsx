'use client';

import { use, useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/db/schema';
import { ArrowLeft, AlertCircle, FileText, Sparkles, Package, Upload, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Utility function to safely normalize any value to an array
// Handles both JSON strings and actual arrays
function normalizeToArray<T>(value: T | T[] | string | null | undefined): T[] {
  if (!value) return [];
  
  // If it's a JSON string, parse it first
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Not valid JSON, return empty array
      return [];
    }
  }
  
  return Array.isArray(value) ? value : [value];
}

type Order = {
  id: number;
  userId: number | null;
  productType: 'CV' | 'COVER_LETTER' | 'BUNDLE';
  status: string;
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  basicInfo: any;
  formData: any;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  finishedFileUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function UploadFinishedFile({ orderId, onSuccess }: { orderId: number; onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Bitte wähle eine Datei aus');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/admin/orders/${orderId}/upload-finished`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload fehlgeschlagen');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hochladen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-600" />
          Fertige Unterlagen hochladen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="file">PDF-Datei auswählen *</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
            <p className="text-xs text-gray-600 mt-1">Maximale Dateigröße: 20MB</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Hochladen & Auftrag abschließen
              </>
            )}
          </Button>

          <p className="text-xs text-gray-600">
            Nach dem Upload wird der Auftrag auf "Abgeschlossen" gesetzt und der Kunde erhält
            automatisch eine E-Mail.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: userData, isLoading: isUserLoading } = useSWR<User>('/api/user', fetcher);
  const { data, error, isLoading } = useSWR<{ order: Order }>(
    `/api/admin/orders/${resolvedParams.id}`,
    fetcher
  );

  const user = userData;

  // Auto-start order when admin opens it (only if READY_FOR_PROCESSING)
  // Status flow: PENDING_PAYMENT → PAID → READY_FOR_PROCESSING → IN_PROGRESS → COMPLETED
  // Only orders with completed questionnaire (READY_FOR_PROCESSING) can be started
  useEffect(() => {
    if (data?.order && data.order.status === 'READY_FOR_PROCESSING') {
      fetch(`/api/admin/orders/${resolvedParams.id}/start`, {
        method: 'POST'
      })
        .then(() => {
          // Refresh order data after status change
          mutate(`/api/admin/orders/${resolvedParams.id}`);
        })
        .catch((err) => {
          console.error('Failed to auto-start order:', err);
        });
    }
  }, [data?.order, resolvedParams.id]);

  if (isUserLoading) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <p className="text-gray-600">Lade Berechtigungen...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <Card className="max-w-2xl mx-auto border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Keine Berechtigung</h2>
            <p className="text-gray-600">Du hast keine Berechtigung, diese Seite zu sehen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <p className="text-gray-600">Lade Auftrag...</p>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <Card className="max-w-2xl mx-auto border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Auftrag nicht gefunden</h2>
            <Button asChild>
              <Link href="/admin/orders">Zurück zur Übersicht</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = data.order;

  const productIcons: Record<string, typeof FileText> = {
    CV: FileText,
    COVER_LETTER: Sparkles,
    BUNDLE: Package
  };

  const productLabels: Record<string, string> = {
    CV: 'Lebenslauf',
    COVER_LETTER: 'Anschreiben',
    BUNDLE: 'Komplett-Bundle'
  };

  const Icon = productIcons[order.productType];

  return (
    <div className="flex-1 min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Auftrag #{order.id}
              </h1>
              <p className="text-gray-600">{productLabels[order.productType]}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Kundendaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{order.customerName || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">E-Mail</p>
                <p className="font-semibold">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="font-semibold">{order.customerPhone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge>{order.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Auftragsinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Bestellt am</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleString('de-DE')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Zuletzt aktualisiert</p>
                <p className="font-semibold">
                  {new Date(order.updatedAt).toLocaleString('de-DE')}
                </p>
              </div>
              {order.stripeSessionId && (
                <div>
                  <p className="text-sm text-gray-600">Stripe Session ID</p>
                  <p className="font-mono text-xs">{order.stripeSessionId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Basic Info */}
        {order.basicInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vorname</p>
                  <p className="font-semibold">{order.basicInfo.firstName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nachname</p>
                  <p className="font-semibold">{order.basicInfo.lastName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-Mail</p>
                  <p className="font-semibold">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-semibold">{order.basicInfo.phone || order.customerPhone || '—'}</p>
                </div>
                {order.basicInfo.street && (
                  <div>
                    <p className="text-sm text-gray-600">Straße & Hausnummer</p>
                    <p className="font-semibold">{order.basicInfo.street}</p>
                  </div>
                )}
                {(order.basicInfo.postalCode || order.basicInfo.city) && (
                  <div>
                    <p className="text-sm text-gray-600">PLZ & Ort</p>
                    <p className="font-semibold">
                      {order.basicInfo.postalCode && order.basicInfo.city
                        ? `${order.basicInfo.postalCode} ${order.basicInfo.city}`
                        : order.basicInfo.postalCode || order.basicInfo.city || '—'}
                    </p>
                  </div>
                )}
                {order.basicInfo.birthDate && (
                  <div>
                    <p className="text-sm text-gray-600">Geburtsdatum</p>
                    <p className="font-semibold">
                      {new Date(order.basicInfo.birthDate).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {order.basicInfo.additionalInfo && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Zusätzliche Informationen</p>
                    <p className="font-semibold whitespace-pre-wrap">{order.basicInfo.additionalInfo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Data - Always show all fields, even if empty */}
        {order.formData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Fragebogen-Daten</CardTitle>
            </CardHeader>
            <CardContent>
              {/* CV Section - show if productType includes CV */}
              {(order.productType === 'CV' || order.productType === 'BUNDLE') && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-4 text-orange-600">Lebenslauf-Informationen</h3>
                  <div className="space-y-6">
                    {/* Zielposition */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Zielposition / Jobbeschreibung</p>
                      <p className={`whitespace-pre-wrap bg-gray-50 p-3 rounded-lg ${order.formData?.cv?.jobDescription ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {order.formData?.cv?.jobDescription || 'Nicht ausgefüllt'}
                      </p>
                    </div>

                    {/* Work Experience */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Berufserfahrung</p>
                      {normalizeToArray(order.formData?.cv?.workExperience || order.formData?.cv?.workExperiences).length > 0 ? (
                        <div className="space-y-4">
                          {normalizeToArray(order.formData?.cv?.workExperience || order.formData?.cv?.workExperiences).map((exp: any, index: number) => (
                            <div key={index} className="bg-orange-50 border border-orange-200 p-3 sm:p-4 rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 break-words">{exp.position || '—'}</h4>
                                  <p className="text-gray-700 break-words">{exp.company || '—'}</p>
                                </div>
                                <span className="text-sm text-gray-600 sm:whitespace-nowrap sm:ml-4 flex-shrink-0">
                                  {exp.startMonth && exp.startYear ? `${exp.startMonth}/${exp.startYear}` : exp.startYear || '—'} -{' '}
                                  {exp.isCurrent ? (
                                    <span className="text-orange-600 font-medium">Aktuell</span>
                                  ) : exp.endMonth && exp.endYear ? (
                                    `${exp.endMonth}/${exp.endYear}`
                                  ) : (
                                    exp.endYear || '—'
                                  )}
                                </span>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500 mb-1">Tätigkeiten & Erfolge:</p>
                                <p className={`text-sm whitespace-pre-wrap break-words ${exp.responsibilities ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                                  {exp.responsibilities || 'Nicht ausgefüllt'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic bg-gray-50 p-3 rounded-lg">Keine Einträge</p>
                      )}
                    </div>

                    {/* Education */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Ausbildung / Studium</p>
                      {normalizeToArray(order.formData?.cv?.education).length > 0 ? (
                        <div className="space-y-4">
                          {normalizeToArray(order.formData?.cv?.education).map((edu: any, index: number) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 break-words">{edu.degree || '—'}</h4>
                                  <p className="text-gray-700 break-words">{edu.institution || '—'}</p>
                                  <p className="text-sm text-gray-600 italic break-words">{edu.field || '—'}</p>
                                </div>
                                <span className="text-sm text-gray-600 sm:whitespace-nowrap sm:ml-4 flex-shrink-0">
                                  {edu.startYear || '—'} - {edu.endYear || '—'}
                                </span>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500 mb-1">Beschreibung:</p>
                                <p className={`text-sm whitespace-pre-wrap break-words ${edu.description ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                                  {edu.description || 'Nicht ausgefüllt'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic bg-gray-50 p-3 rounded-lg">Keine Einträge</p>
                      )}
                    </div>

                    {/* Voluntary Work */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Engagements & Ehrenämter</p>
                      {normalizeToArray(order.formData?.cv?.voluntaryWork).length > 0 ? (
                        <div className="space-y-4">
                          {normalizeToArray(order.formData?.cv?.voluntaryWork).map((vol: any, index: number) => (
                            <div key={index} className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 break-words">{vol.role || '—'}</h4>
                                  <p className="text-gray-700 break-words">{vol.organization || '—'}</p>
                                </div>
                                <span className="text-sm text-gray-600 sm:whitespace-nowrap sm:ml-4 flex-shrink-0">
                                  {vol.startMonth && vol.startYear ? `${vol.startMonth}/${vol.startYear}` : vol.startYear || '—'} -{' '}
                                  {vol.isCurrent ? (
                                    <span className="text-green-600 font-medium">Aktuell</span>
                                  ) : vol.endMonth && vol.endYear ? (
                                    `${vol.endMonth}/${vol.endYear}`
                                  ) : (
                                    vol.endYear || '—'
                                  )}
                                </span>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500 mb-1">Beschreibung:</p>
                                <p className={`text-sm whitespace-pre-wrap break-words ${vol.description ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                                  {vol.description || 'Nicht ausgefüllt'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic bg-gray-50 p-3 rounded-lg">Keine Einträge</p>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Fähigkeiten & Kenntnisse</p>
                      <p className={`whitespace-pre-wrap bg-gray-50 p-3 rounded-lg ${order.formData?.cv?.skills ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {order.formData?.cv?.skills || 'Nicht ausgefüllt'}
                      </p>
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">LinkedIn-Profil</p>
                      {order.formData?.cv?.linkedinUrl ? (
                        <a
                          href={order.formData.cv.linkedinUrl.startsWith('http') ? order.formData.cv.linkedinUrl : `https://${order.formData.cv.linkedinUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {order.formData.cv.linkedinUrl}
                        </a>
                      ) : (
                        <p className="text-gray-400 italic">Nicht angegeben</p>
                      )}
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Hochgeladener Lebenslauf</p>
                      {order.formData?.cv?.resumePath ? (
                        <a
                          href={order.formData.cv.resumePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Lebenslauf ansehen
                        </a>
                      ) : (
                        <p className="text-gray-400 italic">Keine Datei hochgeladen</p>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Zusätzliche Informationen</p>
                      <p className={`whitespace-pre-wrap bg-gray-50 p-3 rounded-lg ${order.formData?.cv?.additionalInfo ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {order.formData?.cv?.additionalInfo || 'Nicht ausgefüllt'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Letter Section - show if productType includes Cover Letter */}
              {(order.productType === 'COVER_LETTER' || order.productType === 'BUNDLE') && (
                <div className={order.productType === 'BUNDLE' ? 'border-t pt-6' : ''}>
                  <h3 className="font-semibold text-lg mb-4 text-orange-600">Anschreiben-Informationen</h3>
                  <div className="space-y-4">
                    {/* Position & Company */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Ziel-Position</p>
                        <p className={`font-semibold ${order.formData?.coverLetter?.jobTitle ? 'text-gray-900' : 'text-gray-400 italic font-normal'}`}>
                          {order.formData?.coverLetter?.jobTitle || 'Nicht ausgefüllt'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Firma</p>
                        <p className={`font-semibold ${order.formData?.coverLetter?.companyName ? 'text-gray-900' : 'text-gray-400 italic font-normal'}`}>
                          {order.formData?.coverLetter?.companyName || 'Nicht ausgefüllt'}
                        </p>
                      </div>
                    </div>

                    {/* Job Posting URL */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Link zur Stellenanzeige</p>
                      {order.formData?.coverLetter?.jobPostingUrl ? (
                        <a
                          href={order.formData.coverLetter.jobPostingUrl.startsWith('http') ? order.formData.coverLetter.jobPostingUrl : `https://${order.formData.coverLetter.jobPostingUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {order.formData.coverLetter.jobPostingUrl}
                        </a>
                      ) : (
                        <p className="text-gray-400 italic">Nicht angegeben</p>
                      )}
                    </div>

                    {/* Job Description */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Stellenbeschreibung / Anforderungen</p>
                      <p className={`whitespace-pre-wrap bg-gray-50 p-3 rounded-lg ${order.formData?.coverLetter?.jobDescriptionText ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {order.formData?.coverLetter?.jobDescriptionText || 'Nicht ausgefüllt'}
                      </p>
                    </div>

                    {/* Experiences to Highlight */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Erfahrungen hervorheben</p>
                      <p className={`whitespace-pre-wrap bg-gray-50 p-3 rounded-lg ${order.formData?.coverLetter?.experiencesToHighlight ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {order.formData?.coverLetter?.experiencesToHighlight || 'Nicht ausgefüllt'}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Stärken</p>
                      <p className={`whitespace-pre-wrap bg-gray-50 p-3 rounded-lg ${order.formData?.coverLetter?.strengths ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {order.formData?.coverLetter?.strengths || 'Nicht ausgefüllt'}
                      </p>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Zusätzliche Hinweise</p>
                      <p className={`whitespace-pre-wrap bg-gray-50 p-3 rounded-lg ${order.formData?.coverLetter?.additionalInfo ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {order.formData?.coverLetter?.additionalInfo || 'Nicht ausgefüllt'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message if no formData yet */}
              {!order.formData?.cv && !order.formData?.coverLetter && (
                <p className="text-gray-500 italic text-center py-4">
                  Der Kunde hat den Fragebogen noch nicht ausgefüllt.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show card if formData is null */}
        {!order.formData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Fragebogen-Daten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 italic text-center py-4">
                Der Kunde hat den Fragebogen noch nicht ausgefüllt.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upload Finished File */}
        {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
          <div className="mt-6">
            <UploadFinishedFile
              orderId={order.id}
              onSuccess={() => {
                mutate(`/api/admin/orders/${resolvedParams.id}`);
              }}
            />
          </div>
        )}

        {/* Finished File Download */}
        {order.finishedFileUrl && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Fertige Datei</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3">
                Die fertigen Unterlagen wurden hochgeladen und der Kunde wurde benachrichtigt.
              </p>
              <a
                href={order.finishedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Datei öffnen
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
