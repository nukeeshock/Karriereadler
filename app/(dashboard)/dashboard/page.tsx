'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import useSWR from 'swr';
import { Suspense } from 'react';
import { FileText, ClipboardList, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreditsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  );
}

function UserCredits() {
  const { data: ordersData } = useSWR<{
    orders: {
      id: number;
      productType: 'CV' | 'COVER_LETTER' | 'BUNDLE';
      status: 'PENDING_PAYMENT' | 'PAID' | 'READY_FOR_PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      finishedFileUrl: string | null;
      createdAt: string;
    }[];
  }>('/api/orders', fetcher);
  const { data: purchases } = useSWR<
    { id: number; productType: string | null; createdAt: string }[]
  >('/api/purchases', fetcher);

  const productTypeMap: Record<string, { name: string; icon: string }> = {
    CV: { name: 'Lebenslauf', icon: '📄' },
    COVER_LETTER: { name: 'Anschreiben', icon: '✨' },
    BUNDLE: { name: 'Bundle', icon: '📦' },
    cv: { name: 'Lebenslauf', icon: '📄' },
    letter: { name: 'Anschreiben', icon: '✨' },
    bundle: { name: 'Bundle', icon: '📦' }
  };

  const orders = ordersData?.orders ?? [];
  const questionnaireOrder = orders.find((order) => order.status === 'PAID');
  const completedOrders = orders.filter((order) => order.status === 'COMPLETED' && order.finishedFileUrl);

  const statusCounts = {
    total: orders.length,
    pendingPayment: orders.filter((order) => order.status === 'PENDING_PAYMENT').length,
    paid: orders.filter((order) => order.status === 'PAID').length,
    inProgress: orders.filter((order) => order.status === 'IN_PROGRESS' || order.status === 'READY_FOR_PROCESSING').length,
    completed: orders.filter((order) => order.status === 'COMPLETED').length
  };

  return (
    <div className="space-y-6">
      {/* Primary Action Banner - only show if questionnaire pending */}
      {questionnaireOrder && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Fragebogen ausfüllen</p>
                <p className="text-sm text-gray-600">Auftrag #{questionnaireOrder.id} – bezahlt, Angaben ausstehend</p>
              </div>
            </div>
            <Link
              href={`/dashboard/orders/${questionnaireOrder.id}/complete`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Ausfüllen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Completed Orders Banner */}
      {completedOrders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {completedOrders.length} {completedOrders.length === 1 ? 'Dokument' : 'Dokumente'} zum Download bereit
                </p>
                <p className="text-sm text-gray-600">Deine fertigen Bewerbungsunterlagen warten auf dich</p>
              </div>
            </div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Herunterladen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Order Status Overview */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Auftragsstatus</CardTitle>
            <Link
              href="/dashboard/orders"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Alle ansehen →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Summary - with subtle boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Zahlung offen</p>
              <p className="text-2xl font-bold text-amber-700">{statusCounts.pendingPayment}</p>
            </div>
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">In Bearbeitung</p>
              <p className="text-2xl font-bold text-blue-700">{statusCounts.inProgress}</p>
            </div>
            <div className="p-4 bg-green-50/50 border border-green-100 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Abgeschlossen</p>
              <p className="text-2xl font-bold text-green-700">{statusCounts.completed}</p>
            </div>
          </div>

          {/* Quick Action */}
          <Link
            href="/kaufen"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Neuen Service buchen
          </Link>
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Kaufhistorie</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.map((p) => {
                const productInfo = productTypeMap[p.productType || ''] || { name: 'Unbekannt', icon: '❓' };
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg border border-gray-100">
                        {productInfo.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{productInfo.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Bezahlt
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Noch keine Käufe vorhanden</p>
              <Link
                href="/kaufen"
                className="inline-block mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Jetzt Service buchen →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <section className="flex-1 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Deine Aufträge</h1>
          <p className="text-gray-600 text-sm">Überblick über Bestellungen, Status und Kaufhistorie</p>
        </div>
        <Suspense fallback={<CreditsSkeleton />}>
          <UserCredits />
        </Suspense>
      </div>
    </section>
  );
}

