import type { Metadata } from 'next';
import LoginForm from '@/features/auth/LoginForm';

export const metadata: Metadata = { title: 'Connexion', robots: { index: false, follow: false } };

type SearchParams = Promise<{ retour?: string | string[]; reinitialise?: string | string[] }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// AU1. `retour` est transmis tel quel : il n'est suivi qu'après validation
// (getPostLoginRoute : chemin interne de l'espace du rôle, sinon ignoré).
export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <LoginForm retour={first(params.retour)} resetDone={first(params.reinitialise) === '1'} />;
}
