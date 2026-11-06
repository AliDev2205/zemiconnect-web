import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import DriverControlScreen from '@/features/agent/DriverControlScreen';
import { normalizeZcNumber } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'Fiche de consultation', robots: { index: false, follow: false } };

type SearchParams = Promise<{ q?: string | string[]; numero?: string | string[] }>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// AG3 par recherche exacte (?q=). ?numero= est accepté aussi : c'est le
// lien « Accès agent » d'un profil public trouvé par numéro (lot 1).
export default async function ControlSearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = normalizeZcNumber(first(params.q) ?? first(params.numero) ?? '');
  if (!query) redirect('/agent');
  return <DriverControlScreen key={query} source={{ kind: 'search', query }} />;
}
