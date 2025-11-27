'use client';

import { use, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

export default function AdminCvRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, mutate } = useSWR(`/api/admin/cv-requests/${id}`, fetcher);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/cv-requests/${id}`, {
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
    const jsonData = JSON.stringify(data?.cv_requests, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-request-${id}.json`;
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

  const request = data.cv_requests;
  const user = data.users;
  const workExperience: WorkExperience[] = request.workExperience ? JSON.parse(request.workExperience) : [];
  const education: Education[] = request.education ? JSON.parse(request.education) : [];
  const skills = request.skills ? JSON.parse(request.skills) : {};
  const other = request.other ? JSON.parse(request.other) : {};

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
              Lebenslauf-Anfrage #{id}
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

      {/* Personal Data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Vorname:</span>
              <p className="mt-1">{request.firstName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Nachname:</span>
              <p className="mt-1">{request.lastName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Geburtsdatum:</span>
              <p className="mt-1">{request.birthDate || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Telefon:</span>
              <p className="mt-1">{request.phone || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-600">E-Mail:</span>
              <p className="mt-1">{request.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adresse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p>
              {request.street} {request.houseNumber}
            </p>
            <p>
              {request.zipCode} {request.city}
            </p>
            <p>{request.country}</p>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Berufserfahrung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {workExperience.map((exp, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-lg">{exp.jobTitle}</h3>
                <p className="text-gray-700">{exp.employer}</p>
                <p className="text-sm text-gray-600">
                  {exp.location} | {exp.startDate} - {exp.endDate || 'heute'}
                </p>
                <pre className="mt-2 text-sm whitespace-pre-wrap text-gray-700">{exp.description}</pre>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ausbildung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg">{edu.degree}</h3>
                <p className="text-gray-700">{edu.institution}</p>
                <p className="text-sm text-gray-600">
                  {edu.location} | {edu.startDate} - {edu.endDate}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kenntnisse & Fähigkeiten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skills.technical && (
            <div>
              <span className="font-medium text-gray-700">Technische Skills:</span>
              <p className="mt-1 text-gray-600">{skills.technical}</p>
            </div>
          )}
          {skills.soft && (
            <div>
              <span className="font-medium text-gray-700">Soft Skills:</span>
              <p className="mt-1 text-gray-600">{skills.soft}</p>
            </div>
          )}
          {skills.languages && (
            <div>
              <span className="font-medium text-gray-700">Sprachen:</span>
              <p className="mt-1 text-gray-600">{skills.languages}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other */}
      {(other.certificates || other.driverLicense || other.availability) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sonstiges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {other.certificates && (
              <div>
                <span className="font-medium text-gray-700">Zertifikate:</span>
                <p className="mt-1 text-gray-600">{other.certificates}</p>
              </div>
            )}
            {other.driverLicense && (
              <div>
                <span className="font-medium text-gray-700">Führerschein:</span>
                <p className="mt-1 text-gray-600">{other.driverLicense}</p>
              </div>
            )}
            {other.availability && (
              <div>
                <span className="font-medium text-gray-700">Verfügbarkeit:</span>
                <p className="mt-1 text-gray-600">{other.availability}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo */}
      {request.photoPath && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bewerbungsfoto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img
                src={request.photoPath}
                alt="Bewerbungsfoto"
                className="max-w-xs rounded-lg border shadow-sm"
              />
              <div>
                <a
                  href={request.photoPath}
                  download
                  className="text-sm text-orange-600 hover:underline"
                >
                  Foto herunterladen
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Description */}
      {request.jobDescription && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Stellenbeschreibung (optional angegeben)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded">
              {request.jobDescription}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Language */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sprache</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{request.language}</p>
        </CardContent>
      </Card>
    </section>
  );
}
