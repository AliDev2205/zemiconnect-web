import type { Metadata } from 'next';
import { DriverListScreen } from '@/features/drivers';

export const metadata: Metadata = { title: 'Conducteurs' };

export default function Page() {
  return <DriverListScreen readOnly basePath="/administration/conducteurs" />;
}
