import type { Metadata } from 'next';
import { LogsScreen } from '@/features/logs';

export const metadata: Metadata = { title: 'Journaux' };

// GE8 : audit et consultations des agents, en lecture seule.
export default function Page() {
  return <LogsScreen basePath="/gestion" />;
}
