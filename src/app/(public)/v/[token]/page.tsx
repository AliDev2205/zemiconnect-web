import type { Metadata } from 'next';
import { QrCode } from 'lucide-react';
import PagePlaceholder from '@/components/layout/PagePlaceholder';
import ErrorState from '@/components/ui/ErrorState';
import Card from '@/components/ui/Card';
import { toApiError } from '@/lib/api/errors';
import { publicService } from '@/lib/api/services/public/public';
import type { PublicDriverProfile } from '@/types/driver';

// PU2 via QR. Composant serveur, rendu à chaque requête (no-store) : le statut
// d'un conducteur (suspendu, QR révoqué) doit être exact au moment du scan.
// publicService passe par une instance axios sans cookie (pas de fetch, donc
// pas de cache de données Next) ; le mode fictif est géré par le service.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profil du conducteur',
  robots: { index: false, follow: false },
};

export default async function PublicProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let profile: PublicDriverProfile | null = null;
  let errorStatus: number | null = null;
  let errorMessage = '';
  try {
    profile = await publicService.getByToken(token);
  } catch (error) {
    const apiError = toApiError(error);
    errorStatus = apiError.status;
    errorMessage = apiError.message;
  }

  if (!profile) {
    return (
      <Card padded={false}>
        {errorStatus === 404 ? (
          <ErrorState
            icon={<QrCode size={24} />}
            title="QR non valide"
            message="Ce QR ne correspond à aucun conducteur actif. Il a peut-être été révoqué."
          />
        ) : (
          <ErrorState title="Vérification impossible" message={errorMessage} />
        )}
      </Card>
    );
  }

  return (
    <PagePlaceholder
      title="Profil du conducteur"
      code="PU2"
      subtitle={`${profile.first_name} ${profile.last_name} · ${profile.zc_number}`}
    />
  );
}
