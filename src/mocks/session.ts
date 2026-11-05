// Session du mode fictif : l'utilisateur connecté par le faux /auth/login, gardé
// dans le navigateur pour que le faux /auth/me le renvoie après un rechargement.
// Sans intérêt hors mode fictif (la vraie session est le cookie Sanctum).

const KEY = 'zc_mock_session';

export interface MockSession {
  userId: string;
  // Le mot de passe provisoire a été remplacé pendant cette session.
  passwordChanged: boolean;
}

export function readMockSession(): MockSession | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}

export function writeMockSession(session: MockSession | null): void {
  try {
    if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Stockage indisponible (navigation privée…) : le mode fictif retombe sur le rôle par défaut.
  }
}
