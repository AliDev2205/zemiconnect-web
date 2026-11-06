import type { Metadata } from 'next';
import ManagerListScreen from '@/features/managers/ManagerListScreen';

export const metadata: Metadata = { title: 'Gestionnaires' };

// AD2 : le seul écran de l'administration où l'on écrit.
export default function Page() {
  return <ManagerListScreen />;
}
