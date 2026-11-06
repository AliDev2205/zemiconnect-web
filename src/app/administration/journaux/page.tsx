import type { Metadata } from 'next';
import { LogsScreen } from '@/features/logs';

export const metadata: Metadata = { title: 'Journaux' };

// Même écran que la gestion ; l'onglet « Connexions » sera branché au lot 4.
export default function Page() {
  return <LogsScreen basePath="/administration" />;
}
