import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { lookupPublicProfile } from '@/features/public/lookup';
import PublicDriverProfileView from '@/features/public/PublicDriverProfileView';
import PublicHome from '@/features/public/PublicHome';
import { publicService } from '@/lib/api/services/public/public';
import { normalizeZcNumber } from '@/lib/utils/format';

// PU2 par numéro (?numero=). Même principe que /v/[token] : serveur, no-store,
// vrai 404 (PU3, recherche/not-found.tsx). Recherche exacte sur le numéro
// normalisé, sans validation de format (format non arrêté).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vérification du conducteur',
  robots: { index: false, follow: false },
};

export default async function PublicSearchPage({ searchParams }: { searchParams: Promise<{ numero?: string | string[] }> }) {
  const { numero: raw } = await searchParams;
  const numero = normalizeZcNumber((Array.isArray(raw) ? raw[0] : raw) ?? '');

  if (!numero) redirect('/');

  const result = await lookupPublicProfile(() => publicService.getByNumber(numero));

  if (result.kind === 'not_found') notFound();

  // 429, réseau… : retour à PU1 avec le message et la saisie conservée.
  if (result.kind === 'error') return <PublicHome defaultValue={numero} error={result.message} />;

  return (
    <PublicDriverProfileView
      profile={result.profile}
      verifiedAt={new Date()}
      agentHref={`/connexion?retour=${encodeURIComponent(`/agent/recherche?numero=${encodeURIComponent(numero)}`)}`}
    />
  );
}
