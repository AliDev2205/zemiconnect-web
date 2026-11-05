import type { Metadata } from 'next';
import { MotorcycleListScreen } from '@/features/motorcycles';

export const metadata: Metadata = { title: 'Motos' };

export default function Page() {
  return <MotorcycleListScreen readOnly basePath="/administration/motos" />;
}
