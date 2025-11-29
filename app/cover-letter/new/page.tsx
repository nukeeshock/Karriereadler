import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import LetterFormClient from './letter-form-client';

export default async function NewCoverLetterPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <LetterFormClient />;
}
