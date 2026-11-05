import type { Metadata } from 'next';
import ResetPasswordForm from '@/features/auth/ResetPasswordForm';

export const metadata: Metadata = { title: 'Nouveau mot de passe', robots: { index: false, follow: false } };

type SearchParams = Promise<{ token?: string | string[]; email?: string | string[] }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// AU3 (/reinitialisation?token=&email=, lien reçu par email). Sans jeton ou
// sans email, l'écran affiche directement « Lien expiré ou déjà utilisé ».
export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <ResetPasswordForm token={first(params.token)} email={first(params.email)} />;
}
