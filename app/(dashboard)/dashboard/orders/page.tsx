'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Sparkles,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Order = {
  id: number;
  productType: 'CV' | 'COVER_LETTER' | 'BUNDLE';
  status: 'PENDING_PAYMENT' | 'PAID' | 'READY_FOR_PROCESSING' | 'CANCELLED';
  customerName: string | null;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
};

const productIcons: Record<string, typeof FileText> = {
  CV: FileText,
  COVER_LETTER: Sparkles,
  BUNDLE: Package
};

const productLabels: Record<string, string> = {
  CV: 'Lebenslauf',
  COVER_LETTER: 'Anschreiben',
  BUNDLE: 'Komplett-Bundle'
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  PENDING_PAYMENT: {
    label: 'Zahlung offen',
    variant: 'outline',
    icon: Clock
  },
  PAID: {
    label: 'Bezahlt – Fragebogen ausfüllen',
    variant: 'default',
    icon: AlertCircle
  },
  READY_FOR_PROCESSING: {
    label: 'In Bearbeitung',
    variant: 'secondary',
    icon: Clock
  },
  CANCELLED: {
    label: 'Abgebrochen',
    variant: 'destructive',
    icon: XCircle
  }
};

export default function OrdersPage() {
  const { data, error, isLoading } = useSWR<{ orders: Order[] }>('/api/orders', fetcher);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Meine Aufträge</h1>
          <p className="text-gray-600">Lade Aufträge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Meine Aufträge</h1>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">Fehler beim Laden der Aufträge. Bitte aktualisiere die Seite.</p>
          </div>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="flex-1 min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meine Aufträge</h1>
          <p className="text-gray-600">
            Hier findest du eine Übersicht über alle deine Bestellungen. Fülle den Fragebogen aus, um die
            Bearbeitung zu starten.
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Noch keine Aufträge
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Du hast noch keine Bewerbungsunterlagen bestellt. Starte jetzt und sichere dir
                professionell erstellte Dokumente!
              </p>
              <Button asChild>
                <Link href="/kaufen">
                  Service auswählen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const Icon = productIcons[order.productType];
              const statusInfo = statusConfig[order.status];
              const StatusIcon = statusInfo.icon;
              const canFillQuestionnaire = order.status === 'PAID';

              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Product Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {productLabels[order.productType]}
                            </h3>
                            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Bestellt am {new Date(order.createdAt).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                          {order.customerName && (
                            <p className="text-sm text-gray-500 mt-1">
                              Für: {order.customerName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="flex items-center gap-3">
                        {canFillQuestionnaire && (
                          <Button asChild className="bg-orange-600 hover:bg-orange-700">
                            <Link href={`/dashboard/orders/${order.id}/complete`}>
                              Fragebogen ausfüllen
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        )}
                        {order.status === 'READY_FOR_PROCESSING' && (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">Fragebogen eingereicht</span>
                          </div>
                        )}
                        {order.status === 'PENDING_PAYMENT' && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span>Zahlung ausstehend</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info Banner for PAID status */}
                    {canFillQuestionnaire && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-900">
                          <strong>Wichtig:</strong> Dein Auftrag wartet auf Eingaben! Bitte fülle den Fragebogen aus,
                          damit wir mit der Erstellung beginnen können.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        {orders.length > 0 && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Hilfe benötigt?
              </CardTitle>
              <CardDescription className="text-blue-800">
                Falls du Fragen zu deinen Aufträgen hast oder Unterstützung benötigst, kontaktiere uns gerne.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <Link href="/contact">
                  Kontakt aufnehmen
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
