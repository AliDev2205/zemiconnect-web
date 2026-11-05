import { getHomeRouteForRole, getSpaceFromPathname, ROLE_SPACE } from '@/lib/constants';
import type { Role } from '@/types/user';

// Paramètre `retour` de /connexion : on n'accepte qu'un chemin INTERNE situé
// dans l'espace du rôle connecté. Toute autre valeur (URL absolue, `//hote`,
// `/\hote` que les navigateurs lisent comme `//hote`, autre espace) est
// ignorée, pour éviter une redirection ouverte.
export function safeReturnPath(retour: string | null | undefined, role: Role): string | null {
  if (!retour || !retour.startsWith('/') || retour.startsWith('//')) return null;
  if (/[\\\s]/.test(retour)) return null;

  let pathname: string;
  try {
    // La base fictive force une résolution relative : si l'origine change, c'est un rejet.
    const url = new URL(retour, 'http://zemiconnect.local');
    if (url.origin !== 'http://zemiconnect.local') return null;
    pathname = url.pathname;
  } catch {
    return null;
  }

  return getSpaceFromPathname(pathname) === ROLE_SPACE[role] ? retour : null;
}

// Destination après connexion : AU4 si le mot de passe est provisoire, sinon
// le `retour` validé, sinon l'accueil de l'espace du rôle.
export function getPostLoginRoute(role: Role, mustChangePassword: boolean, retour?: string | null): string {
  if (mustChangePassword) return '/changer-mot-de-passe';
  return safeReturnPath(retour, role) ?? getHomeRouteForRole(role);
}
