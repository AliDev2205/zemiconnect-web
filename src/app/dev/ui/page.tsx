import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UiShowcase from '@/components/dev/UiShowcase';
import AppProviders from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Catalogue UI',
  robots: { index: false, follow: false },
};

// Catalogue des composants ui/ et des badges : développement uniquement.
export default function DevUiPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <AppProviders>
      <UiShowcase />
    </AppProviders>
  );
}
