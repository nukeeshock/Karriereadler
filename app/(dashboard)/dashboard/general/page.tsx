'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

type ActionState = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  street?: string;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  error?: string;
  success?: string;
};

type AccountFormProps = {
  state: ActionState;
  emailValue?: string;
  firstNameValue?: string;
  lastNameValue?: string;
  birthDateValue?: string;
  streetValue?: string;
  houseNumberValue?: string;
  zipCodeValue?: string;
  cityValue?: string;
  countryValue?: string;
};

function AccountForm({
  state,
  emailValue = '',
  firstNameValue = '',
  lastNameValue = '',
  birthDateValue = '',
  streetValue = '',
  houseNumberValue = '',
  zipCodeValue = '',
  cityValue = '',
  countryValue = ''
}: AccountFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="mb-2">
            Vorname
          </Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Vorname"
            defaultValue={state.firstName || firstNameValue}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="mb-2">
            Nachname
          </Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Nachname"
            defaultValue={state.lastName || lastNameValue}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="birthDate" className="mb-2">
          Geburtsdatum
        </Label>
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          defaultValue={state.birthDate || birthDateValue}
          required
        />
      </div>

      <div>
        <Label htmlFor="email" className="mb-2">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          defaultValue={emailValue}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="street" className="mb-2">
            Straße (optional)
          </Label>
          <Input
            id="street"
            name="street"
            placeholder="Straße"
            defaultValue={state.street || streetValue}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="houseNumber" className="mb-2">
              Hausnr. (optional)
            </Label>
            <Input
              id="houseNumber"
              name="houseNumber"
              placeholder="1a"
              defaultValue={state.houseNumber || houseNumberValue}
            />
          </div>
          <div>
            <Label htmlFor="zipCode" className="mb-2">
              PLZ (optional)
            </Label>
            <Input
              id="zipCode"
              name="zipCode"
              placeholder="10115"
              defaultValue={state.zipCode || zipCodeValue}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="mb-2">
            Ort (optional)
          </Label>
          <Input
            id="city"
            name="city"
            placeholder="Berlin"
            defaultValue={state.city || cityValue}
          />
        </div>
        <div>
          <Label htmlFor="country" className="mb-2">
            Land (optional)
          </Label>
          <select
            id="country"
            name="country"
            defaultValue={state.country || countryValue}
            className="w-full rounded-full border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Land auswählen (optional)</option>
            {EU_COUNTRIES.map((c) => (
              <option key={c.code} value={c.label}>
                {c.flag} {c.label}
              </option>
            ))}
            {countryValue && !EU_COUNTRIES.some((c) => c.label === countryValue) && (
              <option value={countryValue}>{countryValue}</option>
            )}
          </select>
        </div>
      </div>
    </>
  );
}

export default function GeneralPage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  const birthDateValue = useMemo(() => {
    const birthDateValue = useMemo(() => {
  const raw = user?.birthDate;

  // Fall 1: ISO-String aus der DB
  if (typeof raw === "string" && raw) {
    return raw.split("T")[0];
  }

  // Optionaler Fallback, falls raw irgendwann doch mal ein Date ist
  if (raw && (raw as any).toISOString) {
    try {
      return (raw as any).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }

  return "";
}, [user?.birthDate]);


  return (
    <section className="flex-1 p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Allgemeine Einstellungen</h1>
        <p className="text-gray-600">Verwalte deine Account-Informationen</p>
      </div>

      <Card className="border-2 shadow-lg max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            Account-Informationen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6" action={formAction}>
            <AccountForm
              state={state}
              emailValue={user?.email ?? ''}
              firstNameValue={user?.firstName ?? ''}
              lastNameValue={user?.lastName ?? ''}
              birthDateValue={birthDateValue}
              streetValue={user?.street ?? ''}
              houseNumberValue={user?.houseNumber ?? ''}
              zipCodeValue={user?.zipCode ?? ''}
              cityValue={user?.city ?? ''}
              countryValue={user?.country ?? ''}
            />
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{state.error}</p>
              </div>
            )}
            {state.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm font-medium">{state.success}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                'Änderungen speichern'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
