'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminLetterRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, mutate } = useSWR(`/api/admin/letter-requests/${id}`, fetcher);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/letter-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        mutate();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadAsJSON = () => {
    const jsonData = JSON.stringify(data?.letter_requests, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letter-request-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center text-red-800">
            <p className="font-semibold">Fehler beim Laden der Anfrage</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <p className="text-center text-gray-500">Lädt...</p>
      </section>
    );
  }

  const request = data.letter_requests;
  const user = data.users;
  const cvRequest = data.cv_requests;

  const getStatusColor = (status: string) => {
    const colors = {
      offen: 'bg-blue-100 text-blue-800',
      in_bearbeitung: 'bg-yellow-100 text-yellow-800',
      fertig: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Link>
        </Button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Anschreiben-Anfrage #{id}
            </h1>
            <p className="text-gray-600">
              Erstellt am {new Date(request.createdAt).toLocaleString('de-DE')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={downloadAsJSON} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Als JSON herunterladen
            </Button>
          </div>
        </div>
      </div>

      {/* Status Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status === 'offen' && 'Offen'}
              {request.status === 'in_bearbeitung' && 'In Bearbeitung'}
              {request.status === 'fertig' && 'Fertig'}
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus('offen')}
                disabled={updatingStatus || request.status === 'offen'}
              >
                → Offen
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus('in_bearbeitung')}
                disabled={updatingStatus || request.status === 'in_bearbeitung'}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                → In Bearbeitung
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus('fertig')}
                disabled={updatingStatus || request.status === 'fertig'}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                → Fertig
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User-Informationen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">User ID:</span>
              <p className="mt-1">{user?.id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">User Name:</span>
              <p className="mt-1">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">User E-Mail:</span>
              <p className="mt-1">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Position */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Zielstelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Jobtitel:</span>
              <p className="mt-1 text-lg font-semibold">{request.jobTitle}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Firma:</span>
              <p className="mt-1 text-lg font-semibold">{request.companyName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Ort:</span>
                <p className="mt-1">{request.location || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Land:</span>
                <p className="mt-1">{request.jobCountry || 'N/A'}</p>
              </div>
            </div>
            {request.jobPostingUrl && (
              <div>
                <span className="font-medium text-gray-600">Link zur Stellenanzeige:</span>
                <p className="mt-1">
                  <a
                    href={request.jobPostingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline flex items-center gap-1"
                  >
                    {request.jobPostingUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      {request.jobDescriptionText && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Stellenbeschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              {request.jobDescriptionText}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Personal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Persönliche Informationen für das Anschreiben</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {request.experiencesToHighlight && (
            <div>
              <span className="font-medium text-gray-700">Erfahrungen / Projekte, die betont werden sollen:</span>
              <pre className="mt-2 text-sm whitespace-pre-wrap text-gray-600 bg-gray-50 p-3 rounded">
                {request.experiencesToHighlight}
              </pre>
            </div>
          )}
          {request.strengths && (
            <div>
              <span className="font-medium text-gray-700">Besondere Stärken / Relevante Fähigkeiten:</span>
              <pre className="mt-2 text-sm whitespace-pre-wrap text-gray-600 bg-gray-50 p-3 rounded">
                {request.strengths}
              </pre>
            </div>
          )}
          {request.additionalNotes && (
            <div>
              <span className="font-medium text-gray-700">Zusätzliche Hinweise:</span>
              <pre className="mt-2 text-sm whitespace-pre-wrap text-gray-600 bg-gray-50 p-3 rounded">
                {request.additionalNotes}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CV Reference */}
      {cvRequest && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Referenzierter Lebenslauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span> {cvRequest.firstName} {cvRequest.lastName}
              </p>
              <p>
                <span className="font-medium">Sprache:</span> {cvRequest.language}
              </p>
              <p>
                <span className="font-medium">Erstellt am:</span>{' '}
                {new Date(cvRequest.createdAt).toLocaleDateString('de-DE')}
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link href={`/admin/cv-requests/${cvRequest.id}`}>CV-Anfrage öffnen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
