import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DriverListScreen } from '@/features/drivers';

export const metadata: Metadata = { title: 'Conducteurs' };

// GE2. Suspense : les filtres sont lus dans l'URL (useSearchParams).
export default function Page() {
  return (
    <Suspense>
      <DriverListScreen basePath="/gestion/conducteurs" />
    </Suspense>
  );
}
