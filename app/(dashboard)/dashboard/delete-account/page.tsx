'use client';

import { useActionState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { hardDeleteAccount } from '@/app/(login)/actions';
import { Loader2, Trash2 } from 'lucide-react';

type DeleteState = {
  password?: string;
  error?: string;
};

export default function DeleteAccountPage() {
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(
    hardDeleteAccount,
    {}
  );

  return (
    <section className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account unwiderruflich löschen</h1>
        <p className="text-gray-600">
          Diese Aktion entfernt dein Konto und alle zugehörigen Daten dauerhaft. Bitte bestätige mit deinem Passwort.
        </p>
      </div>

      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTitle className="text-red-900">Achtung – endgültige Löschung</AlertTitle>
        <AlertDescription className="text-red-800">
          Folgende Daten werden gelöscht:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Benutzerkonto</li>
            <li>Alle CV-Anfragen</li>
            <li>Alle Anschreiben-Anfragen</li>
            <li>Hochgeladene Fotos</li>
            <li>Aktivitätsprotokolle</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            Account permanent löschen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Passwort zur Bestätigung</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={state.password}
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="confirmDeletion"
                name="confirmDeletion"
                value="true"
                required
                className="mt-1"
              />
              <Label htmlFor="confirmDeletion" className="text-sm text-gray-800 leading-relaxed">
                Ich bestätige die unwiderrufliche Löschung meines Accounts und aller zugehörigen Daten.
              </Label>
            </div>

            {state.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{state.error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700 rounded-full py-3 font-semibold"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                'Account permanent löschen'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
