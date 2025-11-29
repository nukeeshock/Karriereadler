import { requestPasswordReset } from '../password-reset-actions';
import ForgotPasswordForm from './forgot-password-form';

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm action={requestPasswordReset} />;
}
