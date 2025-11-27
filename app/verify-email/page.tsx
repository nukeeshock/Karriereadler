'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setMessage('Kein Verifizierungs-Token gefunden.');
        return;
      }

      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email erfolgreich verifiziert!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verifizierung fehlgeschlagen.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Email wird verifiziert...'}
            {status === 'success' && 'Email verifiziert!'}
            {status === 'error' && 'Verifizierung fehlgeschlagen'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <CardDescription className="text-base">
            {message}
          </CardDescription>

          {status === 'success' && (
            <Button
              asChild
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 rounded-xl shadow-lg"
            >
              <Link href="/sign-in">Jetzt anmelden</Link>
            </Button>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/sign-up">Zurück zur Registrierung</Link>
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <p className="text-sm text-gray-500">
              Bitte warte einen Moment...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
