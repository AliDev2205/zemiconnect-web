import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MotorcycleListScreen } from '@/features/motorcycles';

export const metadata: Metadata = { title: 'Motos' };

// GE5. Suspense : les filtres sont lus dans l'URL (useSearchParams).
export default function Page() {
  return (
    <Suspense>
      <MotorcycleListScreen basePath="/gestion/motos" />
    </Suspense>
  );
}
