import type { Metadata } from 'next';
import DriverControlScreen from '@/features/agent/DriverControlScreen';

export const metadata: Metadata = { title: 'Fiche de consultation', robots: { index: false, follow: false } };

// AG3 par QR. Rendu côté client avec la session agent (cookie Sanctum).
export default async function ControlByTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <DriverControlScreen source={{ kind: 'token', token }} />;
}
