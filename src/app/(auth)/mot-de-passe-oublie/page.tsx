import type { Metadata } from 'next';
import ForgotPasswordForm from '@/features/auth/ForgotPasswordForm';

export const metadata: Metadata = { title: 'Mot de passe oublié', robots: { index: false, follow: false } };

// AU2.
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
