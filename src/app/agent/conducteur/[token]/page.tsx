import type { Metadata } from 'next';
import PagePlaceholder from '@/components/layout/PagePlaceholder';

export const metadata: Metadata = { title: 'Fiche de contrôle' };

// AG3 par QR : la fiche complète passera par useDriverControlByToken (session agent).
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  await params;
  return <PagePlaceholder title="Fiche de contrôle" code="AG3" back={{ href: '/agent', label: 'Accueil' }} />;
}
