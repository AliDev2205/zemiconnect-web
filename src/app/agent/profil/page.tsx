import type { Metadata } from 'next';
import AgentProfileScreen from '@/features/agent/AgentProfileScreen';

export const metadata: Metadata = { title: 'Mon profil' };

// AG5.
export default function AgentProfilePage() {
  return <AgentProfileScreen />;
}
