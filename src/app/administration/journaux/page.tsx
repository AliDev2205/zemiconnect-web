import type { Metadata } from 'next';
import { LogsScreen } from '@/features/logs';

export const metadata: Metadata = { title: 'Journaux' };

export default function Page() {
  return <LogsScreen readOnly />;
}
