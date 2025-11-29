'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type Props = {
  action: (state: any, formData: FormData) => Promise<any>;
};

export default function ForgotPasswordForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    success: '',
    error: ''
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Passwort vergessen</h1>
        <p className="text-sm text-gray-600">Wir senden dir einen Link zum Zurücksetzen deines Passworts.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="deine@email.de"
          />
        </div>

        {state?.success && (
          <div className="text-green-600 text-sm">{state.success}</div>
        )}
        {state?.error && (
          <div className="text-red-600 text-sm">{state.error}</div>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Wird gesendet...
            </>
          ) : (
            'Link senden'
          )}
        </Button>
      </form>
      <div className="text-sm text-center">
        <Link href="/sign-in" className="text-[color:#3f7cc7] underline">
          Zurück zum Login
        </Link>
      </div>
    </div>
  );
}
