'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type Props = {
  action: (state: any, formData: FormData) => Promise<any>;
  token: string;
};

export default function ResetPasswordForm({ action, token }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    success: '',
    error: '',
    token
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Neues Passwort setzen</h1>
        <p className="text-sm text-gray-600">Bitte neues Passwort wählen.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <Label htmlFor="password">Neues Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            maxLength={100}
            required
            placeholder="Mindestens 8 Zeichen, Groß- und Kleinbuchstaben"
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
              Wird gespeichert...
            </>
          ) : (
            'Passwort speichern'
          )}
        </Button>
      </form>
    </div>
  );
}
