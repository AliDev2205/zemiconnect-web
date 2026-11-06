import type { Metadata } from 'next';
import ProfileScreen from '@/features/profile/ProfileScreen';

export const metadata: Metadata = { title: 'Mon profil' };

// GE9 : même contenu que AG5, en colonne de 640 px.
export default function Page() {
  return <ProfileScreen layout="desktop" />;
}
