import type { Metadata } from 'next';
import PagePlaceholder from '@/components/layout/PagePlaceholder';

export const metadata: Metadata = { title: 'Rechercher un conducteur' };

export default function Page() {
  return <PagePlaceholder title="Rechercher un conducteur" code="AG3" subtitle="Par numéro ZemiConnect ou immatriculation" />;
}
