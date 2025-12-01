'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, FileText, Sparkles, Package, Loader2 } from 'lucide-react';
import { WiderrufsCheckbox } from '@/components/checkout/widerrufs-checkbox';
import { User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ProductKey = 'CV' | 'COVER_LETTER' | 'BUNDLE';

const products: {
  key: ProductKey;
  title: string;
  description: string;
  price: number;
  icon: typeof FileText;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    key: 'CV',
    title: 'Lebenslauf',
    description: 'Professionell erstellter Lebenslauf',
    price: 20,
    icon: FileText,
    features: [
      '1x individueller Lebenslauf',
      'Von Experten erstellt',
      'Korrekturschleife inklusive',
      'Kein Abo, einmalig zahlen'
    ]
  },
  {
    key: 'COVER_LETTER',
    title: 'Anschreiben',
    description: 'Individuell verfasstes Anschreiben',
    price: 20,
    icon: Sparkles,
    features: [
      '1x maßgeschneidertes Anschreiben',
      'Auf deine Zielposition abgestimmt',
      'Korrekturschleife inklusive',
      'Professionell formuliert'
    ]
  },
  {
    key: 'BUNDLE',
    title: 'Komplett-Bundle',
    description: 'Lebenslauf + Anschreiben zum Vorteilspreis',
    price: 30,
    icon: Package,
    features: [
      '1x Lebenslauf',
      '1x Anschreiben',
      '10 € gespart',
      'Komplett-Paket für deine Bewerbung'
    ],
    highlight: true
  }
];

export default function KaufenPage() {
  const searchParams = useSearchParams();
  const { data: user, isLoading: isUserLoading } = useSWR<User | null>('/api/user', fetcher);

  // Determine initial product from URL
  const initialProduct = searchParams.get('product');
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>(() => {
    if (initialProduct === 'cv') return 'CV';
    if (initialProduct === 'cover') return 'COVER_LETTER';
    if (initialProduct === 'bundle') return 'BUNDLE';
    return 'BUNDLE'; // Default to bundle
  });

  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Pre-fill from user data
  useEffect(() => {
    if (user) {
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.email) setEmail(user.email);
      if (user.phoneNumber) setPhone(user.phoneNumber);
      if (user.street) setStreet(user.street);
      if (user.zipCode) setPostalCode(user.zipCode);
      if (user.city) setCity(user.city);
      if (user.birthDate) setBirthDate(user.birthDate);
    }
  }, [user]);

  // State
  const [widerrufsAccepted, setWiderrufsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isUserLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Nutzerdaten werden geladen...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bitte anmelden, um zu kaufen
          </h1>
          <p className="text-gray-600 mb-8">
            Melde dich an oder registriere dich, um deinen Auftrag zu starten und die Zahlung sicher abzuschließen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors duration-200"
            >
              Anmelden
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              Registrieren
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const selectedProductData = products.find((p) => p.key === selectedProduct)!;
  const Icon = selectedProductData.icon;

  async function handleCheckout() {
    setError(null);

    if (!user) {
      setError('Bitte melde dich an, um eine Bestellung zu erstellen.');
      return;
    }

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Bitte gib Vor- und Nachnamen an.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Bitte gib eine gültige E-Mail-Adresse an.');
      return;
    }
    if (!phone.trim()) {
      setError('Bitte gib eine Telefonnummer an.');
      return;
    }
    if (!street.trim()) {
      setError('Bitte gib deine Straße und Hausnummer an.');
      return;
    }
    if (!postalCode.trim() || !/^\d{5}$/.test(postalCode)) {
      setError('Bitte gib eine gültige 5-stellige Postleitzahl an.');
      return;
    }
    if (!city.trim()) {
      setError('Bitte gib deinen Ort an.');
      return;
    }
    if (!birthDate.trim()) {
      setError('Bitte gib dein Geburtsdatum an.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: selectedProduct,
          customerName: `${firstName} ${lastName}`.trim(),
          customerEmail: email,
          customerPhone: phone,
          basicInfo: {
            firstName,
            lastName,
            phone,
            street,
            postalCode,
            city,
            birthDate,
            additionalInfo
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Bestellung.');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Keine Checkout-URL erhalten.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wähle deinen Service
          </h1>
          <p className="text-gray-600">
            Einmalige Zahlung, keine versteckten Kosten
          </p>
        </div>

        {/* Product Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Service auswählen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((product) => {
              const isSelected = selectedProduct === product.key;
              const ProductIcon = product.icon;
              return (
                <button
                  key={product.key}
                  onClick={() => setSelectedProduct(product.key)}
                  className={`relative p-5 rounded-lg border-2 transition-colors duration-200 text-left ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {product.highlight && (
                    <div className="absolute -top-3 left-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Empfohlen
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3 mt-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-orange-500' : 'bg-orange-100'
                      }`}
                    >
                      <ProductIcon
                        className={`w-5 h-5 ${
                          isSelected ? 'text-white' : 'text-orange-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {product.price} €
                    <span className="text-sm font-normal text-gray-500 ml-1">einmalig</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic Data Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">2. Deine Daten</CardTitle>
            <CardDescription>
              Diese Informationen helfen uns, deine Bewerbungsunterlagen optimal vorzubereiten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Vorname *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@beispiel.de"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefonnummer *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 123 456789"
                required
              />
            </div>

            <div>
              <Label htmlFor="street">Straße & Hausnummer *</Label>
              <Input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Musterstraße 123"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postleitzahl *</Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="12345"
                  pattern="\d{5}"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">Ort *</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Berlin"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="birthDate">Geburtsdatum *</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="additionalInfo">
                Zusätzliche Informationen
              </Label>
              <Textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="z.B. Zielbranche, gewünschte Position, Besonderheiten..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Widerrufsrecht */}
        <div className="mb-6">
          <WiderrufsCheckbox
            checked={widerrufsAccepted}
            onChange={setWiderrufsAccepted}
          />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center text-sm">{error}</p>
          </div>
        )}

        {/* Price Summary & Checkout */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gewählter Service</p>
                  <p className="font-semibold text-gray-900">{selectedProductData.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Preis</p>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedProductData.price} €
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {selectedProductData.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={!widerrufsAccepted || loading}
              className="w-full py-4 text-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Weiterleitung zur Zahlung...
                </span>
              ) : (
                <span>Zur sicheren Zahlung</span>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Sichere Zahlung über Stripe · Einmalige Zahlung · Kein Abo
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
