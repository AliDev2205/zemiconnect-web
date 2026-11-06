import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DriverListScreen } from '@/features/drivers';

export const metadata: Metadata = { title: 'Conducteurs' };

export default function Page() {
  return (
    <Suspense>
      <DriverListScreen readOnly basePath="/administration/conducteurs" />
    </Suspense>
  );
}
