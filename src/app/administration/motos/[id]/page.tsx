import type { Metadata } from 'next';
import { MotorcycleDetailScreen } from '@/features/motorcycles';

export const metadata: Metadata = { title: 'Fiche moto' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MotorcycleDetailScreen id={id} readOnly basePath="/administration/motos" />;
}
