import type { Metadata } from 'next';
import { LogsScreen } from '@/features/logs';

export const metadata: Metadata = { title: 'Journaux' };

// AD4 : GE8 avec l'onglet « Connexions », toutes les actions de tous les comptes.
export default function Page() {
  return <LogsScreen basePath="/administration" withConnections allAccounts />;
}
