import type { Metadata } from 'next';
import ProfileScreen from '@/features/profile/ProfileScreen';

export const metadata: Metadata = { title: 'Mon profil' };

// AG5.
export default function AgentProfilePage() {
  return <ProfileScreen layout="mobile" />;
}
