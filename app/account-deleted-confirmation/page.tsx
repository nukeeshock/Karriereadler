import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function AccountDeletedConfirmationPage() {
  return (
    <section className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4">
      <Card className="max-w-md w-full shadow-lg border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Account gelöscht</CardTitle>
          <CardDescription>
            Dein Konto und alle verknüpften Daten wurden dauerhaft entfernt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-700">
            Vielen Dank, dass du Karriereadler genutzt hast. Du kannst jederzeit ein neues Konto erstellen.
          </p>
          <Button asChild className="w-full rounded-full">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
