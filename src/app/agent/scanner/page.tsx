import type { Metadata } from 'next';
import PagePlaceholder from '@/components/layout/PagePlaceholder';

export const metadata: Metadata = { title: 'Scanner un QR' };

export default function Page() {
  return <PagePlaceholder title="Scanner un QR" code="AG2" back={{ href: '/agent', label: 'Accueil' }} />;
}
