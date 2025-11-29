import { redirect } from 'next/navigation';
import ResetPasswordForm from './reset-password-form';
import { resetPassword } from '../password-reset-actions';

export default async function ResetPasswordPage(props: any) {
  const searchParams = await props?.searchParams;
  const tokenParam = searchParams?.token;
  const token = typeof tokenParam === 'string' ? tokenParam : '';

  if (!token) {
    redirect('/forgot-password');
  }

  return <ResetPasswordForm action={resetPassword} token={token} />;
}
