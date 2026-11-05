import type { Me, Role } from '@/types/user';
import { isRole } from '@/lib/constants';

// Indices de session lisibles par proxy.ts. La vraie session est le cookie
// Sanctum (httpOnly, posé par l'API) : ces cookies ne sont qu'un CONFORT de
// navigation, falsifiables par l'utilisateur, et ne donnent accès à aucune
// donnée - l'API vérifie la session et le rôle à chaque appel (401/403).
export const ROLE_COOKIE = 'zc_role';
// Présent tant que le mot de passe provisoire n'a pas été remplacé (AU4).
export const PASSWORD_CHANGE_COOKIE = 'zc_mdp_provisoire';

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

function writeCookie(name: string, value: string, maxAge?: number): void {
  if (typeof document === 'undefined') return;
  // Sans max-age : cookie de session, effacé à la fermeture du navigateur.
  const age = maxAge === undefined ? '' : `; max-age=${maxAge}`;
  document.cookie = `${name}=${value}; path=/${age}; samesite=lax`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
    ?.split('=')[1];
}

const REMEMBER_COOKIE = 'zc_rester';

// remember (« Rester connecté ») : l'indice survit à la fermeture du navigateur,
// comme le cookie « remember me » de Laravel. Non précisé : on garde le choix
// fait à la connexion (appel depuis le garde ou le sélecteur de rôle fictif).
export function setRoleHint(role: Role, remember?: boolean): void {
  const keep = remember ?? readCookie(REMEMBER_COOKIE) === '1';
  writeCookie(ROLE_COOKIE, role, keep ? REMEMBER_MAX_AGE : undefined);
  writeCookie(REMEMBER_COOKIE, keep ? '1' : '', keep ? REMEMBER_MAX_AGE : 0);
}

export function setPasswordChangeHint(required: boolean): void {
  writeCookie(PASSWORD_CHANGE_COOKIE, required ? '1' : '', required ? undefined : 0);
}

// Pose les deux indices d'après /auth/me (connexion, garde).
export function setSessionHints(me: Me, remember?: boolean): void {
  setRoleHint(me.user.role, remember);
  setPasswordChangeHint(me.user.must_change_password);
}

export function clearSessionHints(): void {
  writeCookie(ROLE_COOKIE, '', 0);
  writeCookie(PASSWORD_CHANGE_COOKIE, '', 0);
  writeCookie(REMEMBER_COOKIE, '', 0);
}

export function getRoleHint(): Role | null {
  const value = readCookie(ROLE_COOKIE);
  return isRole(value) ? value : null;
}
