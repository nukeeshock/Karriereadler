import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const products = [
  {
    name: 'Lebenslauf-Service',
    priceEuro: 20,
    description: 'Dein Lebenslauf wird professionell von uns gefertigt.',
    features: ['1x Lebenslauf', 'Individuell erstellt von Experten', 'Kein Abo'],
    productType: 'cv'
  },
  {
    name: 'Anschreiben-Service',
    priceEuro: 20,
    description: 'Zwei individuelle Anschreiben für unterschiedliche Stellenangebote.',
    features: ['2x Anschreiben', 'Ton & Struktur nach Vorgabe', 'Kein Abo'],
    productType: 'letter'
  },
  {
    name: 'Bundle: Lebenslauf + Anschreiben',
    priceEuro: 30,
    description: 'Lebenslauf-Service und zwei Anschreiben zusammen zum Vorteilspreis.',
    features: ['1x Lebenslauf', '2x Anschreiben', '10 € gespart gegenüber Einzelkauf'],
    productType: 'bundle'
  }
] as const;

export default function PricingPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Preise ohne Abo</h1>
        <p className="text-gray-600 mt-2">Zahle pro Ergebnis: Lebenslauf, Anschreiben oder Bundle.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <PricingCard key={product.productType} product={product} />
        ))}
      </div>
    </main>
  );
}

function PricingCard({
  product
}: {
  product: (typeof products)[number];
}) {
  return (
    <div className="pt-6 border rounded-2xl shadow-sm px-6 pb-6 bg-white">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">
        {product.name}
      </h2>
      <p className="text-sm text-gray-600 mb-4">{product.description}</p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        €{product.priceEuro}
        <span className="text-xl font-normal text-gray-600"> einmalig</span>
      </p>
      <ul className="space-y-3 mb-6">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
        <Link href="/dashboard/buy">Jetzt kaufen</Link>
      </Button>
    </div>
  );
}
