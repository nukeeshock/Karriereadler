'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { User } from '@/lib/db/schema';
import { useI18n } from '@/components/providers/i18n-provider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OwnerPage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: admins, mutate } = useSWR<{ admins: User[] }>('/api/owner/admins', fetcher);
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!user || user.role !== 'owner') {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <Card>
          <CardContent className="py-8 text-center text-gray-600">{t('roles.notAllowed')}</CardContent>
        </Card>
      </section>
    );
  }

  async function handleSubmit(action: 'add' | 'remove') {
    setStatus('');
    setError('');
    try {
      const res = await fetch('/api/owner/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Error');
      } else {
        setStatus(json.message || 'OK');
        mutate();
        setEmail('');
      }
    } catch (err) {
      setError('Request failed');
    }
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Owner</CardTitle>
            <CardDescription>{t('roles.owner')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin E-Mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={() => handleSubmit('add')} className="bg-orange-500 hover:bg-orange-600">
                Admin hinzufügen
              </Button>
              <Button type="button" variant="outline" onClick={() => handleSubmit('remove')}>
                Admin entfernen
              </Button>
            </div>
            {status && <p className="text-green-600 text-sm">{status}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktuelle Admins</CardTitle>
            <CardDescription>Owner + Admin Rollen</CardDescription>
          </CardHeader>
          <CardContent>
            {!admins ? (
              <p className="text-sm text-gray-500">Lädt...</p>
            ) : admins.admins.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Admins vorhanden.</p>
            ) : (
              <div className="space-y-2">
                {admins.admins.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{a.name || a.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{a.email}</p>
                    </div>
                    <span className="text-xs rounded-full px-3 py-1 bg-orange-100 text-orange-700">
                      {t(`roles.${a.role as 'admin' | 'owner' | 'member'}`)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
