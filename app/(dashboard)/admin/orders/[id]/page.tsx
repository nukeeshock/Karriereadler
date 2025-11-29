'use client';

import { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/db/schema';
import { ArrowLeft, AlertCircle, FileText, Sparkles, Package } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  createdAt: string;
  updatedAt: string;
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: userData, isLoading: isUserLoading } = useSWR<User>('/api/user', fetcher);
  const { data, error, isLoading } = useSWR<{ order: Order }>(
    `/api/admin/orders/${resolvedParams.id}`,
    fetcher
  );

  const user = userData;

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
              <CardTitle>Basis-Informationen (Pre-Order)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(order.basicInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Form Data */}
        {order.formData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Fragebogen-Daten</CardTitle>
            </CardHeader>
            <CardContent>
              {order.formData.cv && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Lebenslauf</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Zielposition / Jobbeschreibung</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{order.formData.cv.jobDescription}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Berufserfahrung</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{order.formData.cv.workExperience}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ausbildung</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{order.formData.cv.education}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Fähigkeiten</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{order.formData.cv.skills}</p>
                    </div>
                    {order.formData.cv.additionalInfo && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Zusätzliche Informationen</p>
                        <p className="text-gray-900 whitespace-pre-wrap">{order.formData.cv.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.formData.coverLetter && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Anschreiben</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ziel-Position</p>
                      <p className="text-gray-900">{order.formData.coverLetter.jobTitle}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Firma</p>
                      <p className="text-gray-900">{order.formData.coverLetter.companyName}</p>
                    </div>
                    {order.formData.coverLetter.jobPostingUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Stellenanzeige</p>
                        <a
                          href={order.formData.coverLetter.jobPostingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {order.formData.coverLetter.jobPostingUrl}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">Stellenbeschreibung</p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {order.formData.coverLetter.jobDescriptionText}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Erfahrungen hervorheben</p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {order.formData.coverLetter.experiencesToHighlight}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Stärken</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{order.formData.coverLetter.strengths}</p>
                    </div>
                    {order.formData.coverLetter.additionalInfo && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Zusätzliche Hinweise</p>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {order.formData.coverLetter.additionalInfo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
