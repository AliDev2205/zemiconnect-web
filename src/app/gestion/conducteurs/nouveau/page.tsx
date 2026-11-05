import type { Metadata } from 'next';
import PagePlaceholder from '@/components/layout/PagePlaceholder';

export const metadata: Metadata = { title: 'Nouveau conducteur' };

export default function Page() {
  return <PagePlaceholder title="Nouveau conducteur" back={{ href: '/gestion/conducteurs', label: 'Conducteurs' }} />;
}
