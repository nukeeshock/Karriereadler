'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import Image from 'next/image';

const EU_COUNTRIES = [
  { code: 'AT', label: 'Österreich', flag: '🇦🇹' },
  { code: 'BE', label: 'Belgien', flag: '🇧🇪' },
  { code: 'BG', label: 'Bulgarien', flag: '🇧🇬' },
  { code: 'HR', label: 'Kroatien', flag: '🇭🇷' },
  { code: 'CY', label: 'Zypern', flag: '🇨🇾' },
  { code: 'CZ', label: 'Tschechien', flag: '🇨🇿' },
  { code: 'DK', label: 'Dänemark', flag: '🇩🇰' },
  { code: 'EE', label: 'Estland', flag: '🇪🇪' },
  { code: 'FI', label: 'Finnland', flag: '🇫🇮' },
  { code: 'FR', label: 'Frankreich', flag: '🇫🇷' },
  { code: 'DE', label: 'Deutschland', flag: '🇩🇪' },
  { code: 'GR', label: 'Griechenland', flag: '🇬🇷' },
  { code: 'HU', label: 'Ungarn', flag: '🇭🇺' },
  { code: 'IE', label: 'Irland', flag: '🇮🇪' },
  { code: 'IT', label: 'Italien', flag: '🇮🇹' },
  { code: 'LV', label: 'Lettland', flag: '🇱🇻' },
  { code: 'LT', label: 'Litauen', flag: '🇱🇹' },
  { code: 'LU', label: 'Luxemburg', flag: '🇱🇺' },
  { code: 'MT', label: 'Malta', flag: '🇲🇹' },
  { code: 'NL', label: 'Niederlande', flag: '🇳🇱' },
  { code: 'PL', label: 'Polen', flag: '🇵🇱' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', label: 'Rumänien', flag: '🇷🇴' },
  { code: 'SK', label: 'Slowakei', flag: '🇸🇰' },
  { code: 'SI', label: 'Slowenien', flag: '🇸🇮' },
  { code: 'ES', label: 'Spanien', flag: '🇪🇸' },
  { code: 'SE', label: 'Schweden', flag: '🇸🇪' }
];

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '', success: '' }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="/karriereadler_logo.jpg"
            alt="Karriereadler Logo"
            width={220}
            height={220}
            className="drop-shadow-sm"
            priority
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {mode === 'signin'
            ? 'Bei deinem Konto anmelden'
            : 'Konto erstellen'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />
          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium text-gray-900">
                    Vorname
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      defaultValue={state.firstName}
                      required
                      maxLength={100}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium text-gray-900">
                    Nachname
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue={state.lastName}
                      required
                      maxLength={100}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate" className="block text-sm font-medium text-gray-900">
                  Geburtsdatum
                </Label>
                <div className="mt-1">
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    defaultValue={state.birthDate}
                    required
                    className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street" className="block text-sm font-medium text-gray-900">
                    Straße & Hausnummer (optional)
                  </Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="street"
                      name="street"
                      type="text"
                      defaultValue={state.street}
                      maxLength={255}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Musterstraße"
                    />
                    <Input
                      id="houseNumber"
                      name="houseNumber"
                      type="text"
                      defaultValue={state.houseNumber}
                      maxLength={20}
                      className="appearance-none rounded-full relative block w-28 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="1a"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="zipCode" className="block text-sm font-medium text-gray-900">
                      PLZ (optional)
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        defaultValue={state.zipCode}
                        maxLength={20}
                        className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                        placeholder="10115"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="city" className="block text-sm font-medium text-gray-900">
                      Ort (optional)
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        defaultValue={state.city}
                        maxLength={100}
                        className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                        placeholder="Berlin"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="block text-sm font-medium text-gray-900">
                  Land (optional)
                </Label>
                <div className="mt-1">
                  <select
                    id="country"
                    name="country"
                    defaultValue={state.country || ''}
                    className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 bg-white"
                  >
                    <option value="">Land auswählen (optional)</option>
                    {EU_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.label}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              E-Mail
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Deine E-Mail-Adresse"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
            >
              Passwort
            </Label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                defaultValue={state.password}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>
          </div>

          {state?.success && (
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              role="status"
              aria-live="polite"
            >
              {state.success}
            </div>
          )}

          {state?.error && (
            <div className="text-red-500 text-sm" role="alert">
              {state.error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Laden...
                </>
              ) : mode === 'signin' ? (
                'Anmelden'
              ) : (
                'Registrieren'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {mode === 'signin'
                  ? 'Neu bei Karriereadler?'
                  : 'Bereits ein Konto?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                redirect ? `?redirect=${redirect}` : ''
              }${priceId ? `&priceId=${priceId}` : ''}`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {mode === 'signin'
                ? 'Konto erstellen'
                : 'Zum bestehenden Konto anmelden'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
