import type { Role } from '@/types/user';

export const APP_NAME = 'ZemiConnect';

export type Space = 'agent' | 'gestion' | 'administration';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  agent: 'Agent de contrôle',
};

// Un rôle = un espace. Sert aux redirections (proxy.ts, AuthGuard).
export const ROLE_SPACE: Record<Role, Space> = {
  admin: 'administration',
  gestionnaire: 'gestion',
  agent: 'agent',
};

export const SPACE_HOME: Record<Space, string> = {
  agent: '/agent',
  gestion: '/gestion',
  administration: '/administration',
};

export const ROLES: Role[] = ['admin', 'gestionnaire', 'agent'];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as string[]).includes(value);
}

export function getHomeRouteForRole(role: Role): string {
  return SPACE_HOME[ROLE_SPACE[role]];
}

export function getSpaceFromPathname(pathname: string): Space | null {
  const segment = pathname.split('/')[1];
  return segment === 'agent' || segment === 'gestion' || segment === 'administration' ? segment : null;
}

// Pages accessibles sans session : un 401 n'y déclenche jamais de redirection.
const PUBLIC_PREFIXES = ['/v/', '/recherche', '/mentions-legales', '/dev/'];
const AUTH_PAGES = ['/connexion', '/mot-de-passe-oublie', '/reinitialisation'];

export function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix.replace(/\/$/, '') || pathname.startsWith(prefix)) ||
    AUTH_PAGES.includes(pathname)
  );
}
