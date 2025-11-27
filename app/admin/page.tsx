'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Mail, User } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type CvRequestSummary = {
  id: number;
  userId: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  userName: string | null;
  userEmail: string;
};

type LetterRequestSummary = {
  id: number;
  userId: number;
  status: string;
  jobTitle: string;
  companyName: string;
  createdAt: string;
  userName: string | null;
  userEmail: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
  const { data: cvRequests, error: cvError } = useSWR<CvRequestSummary[]>('/api/admin/cv-requests', fetcher);
  const { data: letterRequests, error: letterError } = useSWR<LetterRequestSummary[]>(
    '/api/admin/letter-requests',
    fetcher
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      offen: 'bg-blue-100 text-blue-800',
      in_bearbeitung: 'bg-yellow-100 text-yellow-800',
      fertig: 'bg-green-100 text-green-800'
    };
    const labels = {
      offen: 'Offen',
      in_bearbeitung: 'In Bearbeitung',
      fertig: 'Fertig'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (cvError || letterError) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center text-red-800">
            <p className="font-semibold">Zugriff verweigert oder Fehler beim Laden</p>
            <p className="text-sm mt-2">Du benötigst Admin-Rechte (role: owner), um diese Seite zu sehen.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin-Bereich</h1>
          <p className="text-gray-600 mt-1">Übersicht aller Lebenslauf- und Anschreiben-Anfragen</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">CV-Anfragen</p>
                  <p className="text-2xl font-bold text-gray-900">{cvRequests?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Anschreiben-Anfragen</p>
                  <p className="text-2xl font-bold text-gray-900">{letterRequests?.length || 0}</p>
                </div>
                <Mail className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Offen (CV)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {cvRequests?.filter((r) => r.status === 'offen').length || 0}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">!</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Offen (Anschreiben)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {letterRequests?.filter((r) => r.status === 'offen').length || 0}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex gap-4 border-b">
              <button
                onClick={() => setActiveTab('cv')}
                className={`pb-2 px-4 font-medium transition-colors ${
                  activeTab === 'cv' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600'
                }`}
              >
                Lebenslauf-Anfragen
              </button>
              <button
                onClick={() => setActiveTab('letter')}
                className={`pb-2 px-4 font-medium transition-colors ${
                  activeTab === 'letter' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600'
                }`}
              >
                Anschreiben-Anfragen
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {activeTab === 'cv' && (
              <div className="space-y-4">
                {!cvRequests ? (
                  <p className="text-center text-gray-500 py-8">Lädt...</p>
                ) : cvRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Keine Lebenslauf-Anfragen vorhanden.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            E-Mail (Anfrage)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cvRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">#{request.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {request.firstName} {request.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{request.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {request.userName || request.userEmail}
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString('de-DE')}
                            </td>
                            <td className="px-4 py-3">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/cv-requests/${request.id}`}>Details</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'letter' && (
              <div className="space-y-4">
                {!letterRequests ? (
                  <p className="text-center text-gray-500 py-8">Lädt...</p>
                ) : letterRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Keine Anschreiben-Anfragen vorhanden.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Jobtitel
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {letterRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">#{request.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{request.jobTitle}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{request.companyName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {request.userName || request.userEmail}
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(request.createdAt).toLocaleDateString('de-DE')}
                            </td>
                            <td className="px-4 py-3">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/letter-requests/${request.id}`}>Details</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
