// Session du mode fictif : l'utilisateur connecté par le faux /auth/login, gardé
// dans le navigateur pour que le faux /auth/me le renvoie après un rechargement.
// Sans intérêt hors mode fictif (la vraie session est le cookie Sanctum).

import { mockUsers } from './users';

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

// Auteur des entrées du journal fictif : l'utilisateur connecté, à défaut la
// gestionnaire de démonstration.
export function mockActor(): { name: string; role: string } {
  const user = mockUsers.find((candidate) => candidate.id === readMockSession()?.userId) ?? mockUsers.find((candidate) => candidate.role === 'gestionnaire');
  return { name: user ? `${user.first_name} ${user.last_name}` : 'Gestionnaire', role: user?.role ?? 'gestionnaire' };
}

export function writeMockSession(session: MockSession | null): void {
  try {
    if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Stockage indisponible (navigation privée…) : le mode fictif retombe sur le rôle par défaut.
  }
}
