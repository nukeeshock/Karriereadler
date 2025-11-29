'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/db/schema';
import {
  FileText,
  Sparkles,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Order = {
  id: number;
  userId: number | null;
  productType: 'CV' | 'COVER_LETTER' | 'BUNDLE';
  status: 'PENDING_PAYMENT' | 'PAID' | 'READY_FOR_PROCESSING' | 'CANCELLED';
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
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
  BUNDLE: 'Bundle'
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING_PAYMENT: {
    label: 'Zahlung offen',
    variant: 'outline'
  },
  PAID: {
    label: 'Bezahlt',
    variant: 'default'
  },
  READY_FOR_PROCESSING: {
    label: 'Bereit zur Bearbeitung',
    variant: 'secondary'
  },
  CANCELLED: {
    label: 'Abgebrochen',
    variant: 'destructive'
  }
};

export default function AdminOrdersPage() {
  const { data: userData, isLoading: isUserLoading } = useSWR<User>('/api/user', fetcher);
  const { data, error, isLoading } = useSWR<{ orders: Order[] }>('/api/admin/orders', fetcher);
  const [filter, setFilter] = useState<string>('all');

  const user = userData;

  if (isUserLoading) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Aufträge verwalten</h1>
          <p className="text-gray-600">Lade Berechtigungen...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine Berechtigung</h2>
              <p className="text-gray-600">
                Du hast keine Berechtigung, diese Seite zu sehen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Aufträge verwalten</h1>
          <p className="text-gray-600">Lade Aufträge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Aufträge verwalten</h1>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">Fehler beim Laden der Aufträge.</p>
          </div>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING_PAYMENT').length,
    paid: orders.filter((o) => o.status === 'PAID').length,
    ready: orders.filter((o) => o.status === 'READY_FOR_PROCESSING').length
  };

  return (
    <div className="flex-1 min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aufträge verwalten</h1>
          <p className="text-gray-600">Übersicht über alle Kundenaufträge</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Zahlung offen</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Bezahlt</p>
              <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Bereit</p>
              <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Alle
          </Button>
          <Button
            variant={filter === 'PENDING_PAYMENT' ? 'default' : 'outline'}
            onClick={() => setFilter('PENDING_PAYMENT')}
            size="sm"
          >
            Zahlung offen
          </Button>
          <Button
            variant={filter === 'PAID' ? 'default' : 'outline'}
            onClick={() => setFilter('PAID')}
            size="sm"
          >
            Bezahlt
          </Button>
          <Button
            variant={filter === 'READY_FOR_PROCESSING' ? 'default' : 'outline'}
            onClick={() => setFilter('READY_FOR_PROCESSING')}
            size="sm"
          >
            Bereit zur Bearbeitung
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const Icon = productIcons[order.productType];
            const statusInfo = statusConfig[order.status];

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          #{order.id} – {productLabels[order.productType]}
                        </p>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span>👤 {order.customerName || 'N/A'}</span>
                        <span>✉️ {order.customerEmail}</span>
                        <span>
                          📅 {new Date(order.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>

                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Keine Aufträge gefunden.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
