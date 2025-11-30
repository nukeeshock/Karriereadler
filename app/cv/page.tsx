import type { Metadata } from 'next';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function CvPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  redirect('/kaufen');
}
