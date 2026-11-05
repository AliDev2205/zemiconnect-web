import { NextResponse, type NextRequest } from 'next/server';
import { isMockMode } from '@/lib/api/mock';
import { ROLE_COOKIE } from '@/lib/auth/session';
import { getHomeRouteForRole, getSpaceFromPathname, isRole, ROLE_SPACE } from '@/lib/constants';
import type { Role } from '@/types/user';

/*
 * Redirections de CONFORT UNIQUEMENT, CE N'EST PAS UNE MESURE DE SÉCURITÉ.
 *
 * Ce proxy lit le cookie `zc_role`, un simple indice posé par le front après
 * GET /auth/me. Il est lisible et modifiable par l'utilisateur : il sert
 * seulement à éviter d'afficher un espace qui n'est pas le sien (et le
 * clignotement qui suivrait). La session réelle est le cookie Sanctum, et la
 * vraie vérification est faite par l'API Laravel à chaque requête :
 * 401 sans session, 403 hors du rôle. Aucune donnée n'est servie ici.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hint = request.cookies.get(ROLE_COOKIE)?.value;
  // Mode fictif : sans indice, on se comporte comme l'administrateur fictif.
  const role: Role | null = isRole(hint) ? hint : isMockMode() ? 'admin' : null;

  const redirect = (to: string) => NextResponse.redirect(new URL(to, request.url));

  // Déjà identifié : la page de connexion renvoie vers son espace.
  if (pathname === '/connexion') {
    return isRole(hint) ? redirect(getHomeRouteForRole(hint)) : NextResponse.next();
  }

  if (pathname === '/changer-mot-de-passe') {
    return role ? NextResponse.next() : redirect('/connexion');
  }

  const space = getSpaceFromPathname(pathname);
  if (space) {
    if (!role) return redirect('/connexion');
    if (ROLE_SPACE[role] !== space) return redirect(getHomeRouteForRole(role));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/agent/:path*', '/gestion/:path*', '/administration/:path*', '/connexion', '/changer-mot-de-passe'],
};
