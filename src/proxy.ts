import { NextResponse, type NextRequest } from 'next/server';
import { isMockMode } from '@/lib/api/mock';
import { getPostLoginRoute } from '@/lib/auth/redirect';
import { PASSWORD_CHANGE_COOKIE, ROLE_COOKIE } from '@/lib/auth/session';
import { getHomeRouteForRole, getSpaceFromPathname, isRole, ROLE_SPACE } from '@/lib/constants';
import type { Role } from '@/types/user';

/*
 * Redirections de CONFORT UNIQUEMENT, CE N'EST PAS UNE MESURE DE SÉCURITÉ.
 *
 * Ce proxy lit les cookies `zc_role` et `zc_mdp_provisoire`, de simples
 * indices posés par le front après GET /auth/me. Ils sont lisibles et
 * modifiables par l'utilisateur : ils servent seulement à éviter d'afficher un
 * espace qui n'est pas le sien (et le clignotement qui suivrait). La session
 * réelle est le cookie Sanctum, et la vraie vérification est faite par l'API
 * Laravel à chaque requête : 401 sans session, 403 hors du rôle, refus tant
 * que le mot de passe provisoire n'est pas changé. Aucune donnée n'est servie ici.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hint = request.cookies.get(ROLE_COOKIE)?.value;
  // Mode fictif : sans indice, on se comporte comme l'administrateur fictif.
  const role: Role | null = isRole(hint) ? hint : isMockMode() ? 'admin' : null;
  const mustChangePassword = request.cookies.get(PASSWORD_CHANGE_COOKIE)?.value === '1';

  const redirect = (to: string) => NextResponse.redirect(new URL(to, request.url));

  // Déjà identifié : la page de connexion renvoie vers le `retour` validé ou l'espace du rôle.
  if (pathname === '/connexion') {
    return isRole(hint) ? redirect(getPostLoginRoute(hint, mustChangePassword, searchParams.get('retour'))) : NextResponse.next();
  }

  if (pathname === '/changer-mot-de-passe') {
    if (!role) return redirect('/connexion');
    return mustChangePassword || !isRole(hint) ? NextResponse.next() : redirect(getHomeRouteForRole(role));
  }

  // L'administration ne crée pas de dossier : cette adresse n'existe pas. Le
  // code 404 est posé ici, avant tout rendu (la page, rendue en flux dans la
  // coque, ne pourrait plus changer le code HTTP).
  if (pathname === '/administration/conducteurs/nouveau') {
    return NextResponse.rewrite(new URL('/page-introuvable', request.url), { status: 404 });
  }

  const space = getSpaceFromPathname(pathname);
  if (space) {
    if (!role) return redirect(`/connexion?retour=${encodeURIComponent(pathname)}`);
    // Mot de passe provisoire : aucune autre page tant qu'il n'est pas changé (AU4).
    if (mustChangePassword) return redirect('/changer-mot-de-passe');
    if (ROLE_SPACE[role] !== space) return redirect(getHomeRouteForRole(role));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/agent/:path*', '/gestion/:path*', '/administration/:path*', '/connexion', '/changer-mot-de-passe'],
};
