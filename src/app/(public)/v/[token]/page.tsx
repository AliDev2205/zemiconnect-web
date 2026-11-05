import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonClasses } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import { lookupPublicProfile } from '@/features/public/lookup';
import PublicDriverProfileView from '@/features/public/PublicDriverProfileView';
import { publicService } from '@/lib/api/services/public/public';

// PU2 via QR. Composant serveur, rendu à chaque requête (no-store) : le statut
// d'un conducteur (suspendu, QR révoqué) doit être exact au moment du scan.
// publicService passe par une instance axios sans cookie (pas de fetch, donc
// pas de cache de données Next) ; le mode fictif est géré par le service.
// Aucun loading.tsx au-dessus de cette page : la réponse n'est pas streamée,
// donc notFound() renvoie un vrai code HTTP 404 (PU3, (public)/not-found.tsx).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vérification du conducteur',
  robots: { index: false, follow: false },
};

export default async function PublicProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await lookupPublicProfile(() => publicService.getByToken(token));

  if (result.kind === 'not_found') notFound();

  if (result.kind === 'error') {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-10">
        <Card padded={false}>
          <ErrorState
            title="Vérification impossible"
            message={result.message}
            action={
              <Link href={`/v/${encodeURIComponent(token)}`} className={buttonClasses({ variant: 'outline' })}>
                Réessayer
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <PublicDriverProfileView
      profile={result.profile}
      verifiedAt={new Date()}
      agentHref={`/connexion?retour=${encodeURIComponent(`/agent/conducteur/${encodeURIComponent(token)}`)}`}
    />
  );
}
