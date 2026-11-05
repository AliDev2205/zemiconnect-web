import type { Metadata } from 'next';
import { SearchX } from 'lucide-react';
import PagePlaceholder from '@/components/layout/PagePlaceholder';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import { toApiError } from '@/lib/api/errors';
import { publicService } from '@/lib/api/services/public/public';
import type { PublicDriverProfile } from '@/types/driver';

// PU2 par numéro (?numero=). Même principe que /v/[token] : serveur, no-store.
// Le numéro est transmis tel quel : son format n'est pas encore arrêté.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Recherche par numéro',
  robots: { index: false, follow: false },
};

export default async function PublicSearchPage({ searchParams }: { searchParams: Promise<{ numero?: string | string[] }> }) {
  const { numero: raw } = await searchParams;
  const numero = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? '';

  if (!numero) {
    return <PagePlaceholder title="Recherche par numéro" code="PU2" />;
  }

  let profile: PublicDriverProfile | null = null;
  let errorStatus: number | null = null;
  let errorMessage = '';
  try {
    profile = await publicService.getByNumber(numero);
  } catch (error) {
    const apiError = toApiError(error);
    errorStatus = apiError.status;
    errorMessage = apiError.message;
  }

  if (!profile) {
    return (
      <Card padded={false}>
        {errorStatus === 404 ? (
          <ErrorState icon={<SearchX size={24} />} title="Numéro introuvable" message={`Aucun conducteur ne correspond au numéro « ${numero} ».`} />
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
