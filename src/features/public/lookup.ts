import { NETWORK_ERROR_MESSAGE, toApiError } from '@/lib/api/errors';
import type { PublicDriverProfile } from '@/types/driver';

export type PublicLookupResult =
  | { kind: 'found'; profile: PublicDriverProfile }
  | { kind: 'not_found' }
  | { kind: 'error'; message: string };

// Messages des erreurs de recherche publique (PU1, PU2).
function lookupErrorMessage(error: unknown): string {
  const { status } = toApiError(error);
  if (status === 429) return 'Trop de recherches, réessayez dans quelques minutes.';
  if (status === null) return NETWORK_ERROR_MESSAGE;
  return 'La vérification est momentanément indisponible. Réessayez plus tard.';
}

// Appel du service public depuis un composant serveur, ramené à trois cas.
// Le 404 donne PU3 (notFound) ; les autres erreurs restent affichables.
export async function lookupPublicProfile(request: () => Promise<PublicDriverProfile>): Promise<PublicLookupResult> {
  try {
    return { kind: 'found', profile: await request() };
  } catch (error) {
    if (toApiError(error).status === 404) return { kind: 'not_found' };
    return { kind: 'error', message: lookupErrorMessage(error) };
  }
}
