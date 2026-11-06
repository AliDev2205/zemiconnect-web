import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DriverDetailScreen } from '@/features/drivers';
import { toDriverTab } from '@/features/drivers/detail/tabs';

export const metadata: Metadata = { title: 'Fiche conducteur' };

type SearchParams = Promise<{ onglet?: string }>;

// Même fiche que la gestion, en lecture seule (aucun bouton d'écriture rendu).
// L'administration ne crée pas de dossier : /administration/conducteurs/nouveau
// n'existe pas (vraie 404, pas une fiche « introuvable »).
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  const { id } = await params;
  if (id === 'nouveau') notFound();
  const query = await searchParams;
  return <DriverDetailScreen key={id} id={id} readOnly basePath="/administration/conducteurs" initialTab={toDriverTab(query.onglet)} />;
}
