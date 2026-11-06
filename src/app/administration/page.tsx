import type { Metadata } from 'next';
import DashboardScreen from '@/features/dashboard/DashboardScreen';

export const metadata: Metadata = { title: 'Tableau de bord' };

// AD1 : GE1 en lecture seule, plus la carte « Gestionnaires actifs ».
export default function Page() {
  return <DashboardScreen readOnly withManagers basePath="/administration" />;
}
