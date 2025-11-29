import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import CvFormClient from './cv-form-client';

export default async function NewCvPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <CvFormClient />;
}
