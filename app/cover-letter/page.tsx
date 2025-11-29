import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function CoverLetterPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  redirect('/cover-letter/new');
}
