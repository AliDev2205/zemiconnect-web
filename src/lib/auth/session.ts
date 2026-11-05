import type { Role } from '@/types/user';
import { isRole } from '@/lib/constants';

// Indice de rôle lisible par proxy.ts. La vraie session est le cookie Sanctum
// (httpOnly, posé par l'API) : celui-ci n'est qu'un CONFORT de navigation,
// falsifiable par l'utilisateur, et ne donne accès à aucune donnée - l'API
// vérifie la session et le rôle à chaque appel (401/403).
export const ROLE_COOKIE = 'zc_role';

const MAX_AGE = 60 * 60 * 12;

export function setRoleHint(role: Role): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

export function clearRoleHint(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getRoleHint(): Role | null {
  if (typeof document === 'undefined') return null;
  const value = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${ROLE_COOKIE}=`))
    ?.split('=')[1];
  return isRole(value) ? value : null;
}
