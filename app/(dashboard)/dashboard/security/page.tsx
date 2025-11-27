'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Trash2, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { updatePassword, deleteAccount } from '@/app/(login)/actions';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  return (
    <section className="flex-1 p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Sicherheitseinstellungen</h1>
        <p className="text-gray-600">Verwalte dein Passwort und Account-Sicherheit</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Password Update Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              Passwort ändern
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-6" action={passwordAction}>
              <div>
                <Label htmlFor="current-password" className="text-sm font-medium mb-2 block">
                  Aktuelles Passwort
                </Label>
                <Input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  maxLength={100}
                  defaultValue={passwordState.currentPassword}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="text-sm font-medium mb-2 block">
                  Neues Passwort
                </Label>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={100}
                  defaultValue={passwordState.newPassword}
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">Mindestens 8 Zeichen</p>
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-sm font-medium mb-2 block">
                  Neues Passwort bestätigen
                </Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={100}
                  defaultValue={passwordState.confirmPassword}
                  className="h-12"
                />
              </div>
              {passwordState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm font-medium">{passwordState.error}</p>
                </div>
              )}
              {passwordState.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-600 text-sm font-medium">{passwordState.success}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg"
                disabled={isPasswordPending}
              >
                {isPasswordPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Wird aktualisiert...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Passwort aktualisieren
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Delete Account Card */}
        <Card className="border-2 border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
            <CardTitle className="text-xl flex items-center gap-2 text-red-900">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              Account löschen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Achtung: Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden
                permanent gelöscht.
              </p>
            </div>
            <form action={deleteAction} className="space-y-6">
              <div>
                <Label htmlFor="delete-password" className="text-sm font-medium mb-2 block">
                  Passwort zur Bestätigung
                </Label>
                <Input
                  id="delete-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  maxLength={100}
                  defaultValue={deleteState.password}
                  className="h-12"
                />
              </div>
              {deleteState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm font-medium">{deleteState.error}</p>
                </div>
              )}
              <Button
                type="submit"
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700 py-6 text-base font-semibold rounded-xl shadow-lg"
                disabled={isDeletePending}
              >
                {isDeletePending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Wird gelöscht...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-5 w-5" />
                    Account endgültig löschen
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
