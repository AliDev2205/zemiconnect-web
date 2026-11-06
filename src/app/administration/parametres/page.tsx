import type { Metadata } from 'next';
import SettingsScreen from '@/features/settings/SettingsScreen';

export const metadata: Metadata = { title: 'Paramètres' };

// AD5.
export default function Page() {
  return <SettingsScreen />;
}
