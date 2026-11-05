import type { Metadata } from 'next';
import { AgentListScreen } from '@/features/agents';

export const metadata: Metadata = { title: 'Agents' };

export default function Page() {
  return <AgentListScreen readOnly />;
}
