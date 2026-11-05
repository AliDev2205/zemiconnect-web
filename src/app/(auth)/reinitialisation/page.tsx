import type { Metadata } from 'next';
import PagePlaceholder from '@/components/layout/PagePlaceholder';

export const metadata: Metadata = { title: 'Nouveau mot de passe' };

export default function Page() {
  return <PagePlaceholder title="Nouveau mot de passe" />;
}
