import type { Metadata } from 'next';
import PagePlaceholder from '@/components/layout/PagePlaceholder';

export const metadata: Metadata = { title: 'Tableau de bord' };

export default function Page() {
  return <PagePlaceholder title="Tableau de bord" code="GE1" />;
}
