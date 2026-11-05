import type { Metadata } from 'next';
import PagePlaceholder from '@/components/layout/PagePlaceholder';

export const metadata: Metadata = { title: 'Gestionnaires' };

export default function Page() {
  return <PagePlaceholder title="Gestionnaires" subtitle="Comptes des gestionnaires du registre" />;
}
