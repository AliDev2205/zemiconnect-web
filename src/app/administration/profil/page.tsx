import type { Metadata } from 'next';
import ProfileScreen from '@/features/profile/ProfileScreen';

export const metadata: Metadata = { title: 'Mon profil' };

// AD6 : GE9, avec le rôle « Administrateur » en lecture seule.
export default function Page() {
  return <ProfileScreen layout="desktop" />;
}
