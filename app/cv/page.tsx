import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function CvPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  redirect('/cv/new');
}
