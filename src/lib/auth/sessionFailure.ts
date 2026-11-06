import { isAccountDisabledError, toApiError } from '@/lib/api/errors';
import { isMockMode } from '@/lib/api/mock';
import { clearSessionHints } from '@/lib/auth/session';
import { isPublicPath } from '@/lib/constants';
import { writeMockSession } from '@/mocks/session';

// Motifs affichés par /connexion (?motif=).
export type LoginReason = 'session' | 'desactive';

let redirecting = false;

/*
 * Session perdue pendant la navigation :
 * - 401 (session expirée) → /connexion?motif=session&retour=<page courante>,
 *   pour revenir automatiquement sur la fiche après reconnexion ;
 * - 403 compte désactivé → déconnexion immédiate, /connexion?motif=desactive.
 * Jamais sur une page publique ni d'authentification. Appelée par
 * l'intercepteur axios et par le cache React Query (qui couvre aussi le mode
 * fictif, où aucune requête ne passe par axios). Idempotente : un seul départ.
 * Renvoie true si une redirection est lancée.
 */
export function handleSessionFailure(error: unknown): boolean {
  if (typeof window === 'undefined') return false;
  const disabled = isAccountDisabledError(error);
  if (!disabled && toApiError(error).status !== 401) return false;

  const { pathname, search } = window.location;
  if (isPublicPath(pathname)) return false;
  if (redirecting) return true;
  redirecting = true;

  clearSessionHints();
  if (isMockMode()) writeMockSession(null);

  const params = new URLSearchParams({ motif: disabled ? 'desactive' : 'session' });
  if (!disabled) params.set('retour', pathname + search);
  // Rechargement complet : le cache React Query de l'ancienne session disparaît.
  window.location.assign(`/connexion?${params.toString()}`);
  return true;
}
