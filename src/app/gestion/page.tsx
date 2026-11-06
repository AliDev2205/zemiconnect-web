import type { Metadata } from 'next';
import DashboardScreen from '@/features/dashboard/DashboardScreen';

export const metadata: Metadata = { title: 'Tableau de bord' };

// GE1.
export default function Page() {
  return <DashboardScreen basePath="/gestion" />;
}
