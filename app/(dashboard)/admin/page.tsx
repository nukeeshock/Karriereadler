import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { UserRole } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default async function AdminPage() {
  const user = await getUser();

  // Nicht eingeloggt → Login
  if (!user) {
    redirect('/sign-in');
  }

  // Admins/Owners → neue Orders-Verwaltung
  if (user.role === UserRole.ADMIN || user.role === UserRole.OWNER) {
    redirect('/admin/orders');
  }

  // Keine Admin-Berechtigung → Zugriff verweigert
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-900 mb-2">Kein Zugang zu dieser Seite</h1>
              <p className="text-red-700 mb-6">
                Du benötigst Admin-Rechte, um auf diese Seite zugreifen zu können.
              </p>
              <Button asChild>
                <Link href="/" className="inline-flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Zur Startseite
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
