import type { Metadata } from 'next';
import { DriverDetailScreen } from '@/features/drivers';
import { toDriverTab } from '@/features/drivers/detail/tabs';

export const metadata: Metadata = { title: 'Fiche conducteur' };

type SearchParams = Promise<{ onglet?: string; valide?: string }>;

// GE4. ?onglet=identite|moto|documents|qr|historique ; ?valide=1 après la validation.
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  const { id } = await params;
  const query = await searchParams;
  return <DriverDetailScreen key={id} id={id} basePath="/gestion/conducteurs" initialTab={toDriverTab(query.onglet)} justValidated={query.valide === '1'} />;
}
