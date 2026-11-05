import type { Metadata } from 'next';
import { DriverDetailScreen } from '@/features/drivers';

export const metadata: Metadata = { title: 'Fiche conducteur' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DriverDetailScreen id={id} readOnly basePath="/administration/conducteurs" />;
}
