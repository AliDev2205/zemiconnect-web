import { ensureCsrfCookie, http } from '@/lib/api/http';
import { isMockMode, mockError, mockResponse } from '@/lib/api/mock';
import { getRoleHint } from '@/lib/auth/session';
import { pushLog } from '@/mocks/logs';
import { readMockSession, writeMockSession } from '@/mocks/session';
import { MOCK_LOCKED_EMAIL, MOCK_PASSWORD, MOCK_ROLE_PERMISSIONS, mockMeForRole, mockUsers } from '@/mocks/users';
import type { ApiResponse } from '@/types/api';
import type { Me, User } from '@/types/user';

export interface LoginPayload {
  email: string;
  password: string;
  // « Rester connecté sur cet appareil » (remember de Laravel).
  remember: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Champs modifiables par l'utilisateur lui-même (AG5 et profils). L'email ne l'est pas.
export interface ProfilePayload {
  first_name: string;
  last_name: string;
  phone: string | null;
}

// Jeton de réinitialisation du mode fictif qui simule un lien expiré.
export const MOCK_EXPIRED_RESET_TOKEN = 'expire';

function mockMeForUser(user: User, passwordChanged: boolean): Me {
  return {
    user: { ...user, must_change_password: user.must_change_password && !passwordChanged },
    permissions: MOCK_ROLE_PERMISSIONS[user.role],
  };
}

// Faux /auth/me : l'utilisateur de la session fictive s'il correspond au rôle
// courant, sinon le premier utilisateur du rôle choisi dans le sélecteur.
function currentMockMe(): Me {
  const role = getRoleHint() ?? 'admin';
  const session = readMockSession();
  const user = mockUsers.find((candidate) => candidate.id === session?.userId);
  return user && session && user.role === role ? mockMeForUser(user, session.passwordChanged) : mockMeForRole(role);
}

/*
 * Contrat supposé de POST /auth/login (à confirmer avec l'API) :
 * - 422 identifiants incorrects (message unique, sans dire quel champ est faux) ;
 * - 403 compte désactivé ;
 * - 429 trop d'essais, avec l'en-tête Retry-After en secondes.
 */
export const authService = {
  login: async (payload: LoginPayload): Promise<Me> => {
    if (isMockMode()) {
      const email = payload.email.trim().toLowerCase();
      const user = mockUsers.find((candidate) => candidate.email === email);
      // Chaque tentative est inscrite au journal des connexions (comme l'API).
      const record = (result: 'reussie' | 'echouee' | 'bloquee') =>
        pushLog({
          action: 'auth.login',
          actor_name: user ? `${user.first_name} ${user.last_name}` : null,
          actor_role: user?.role ?? null,
          resource_type: null,
          login_email: email,
          login_result: result,
          ip_address: '127.0.0.1',
          user_agent: typeof navigator === 'undefined' ? null : navigator.userAgent.slice(0, 80),
        });
      if (email === MOCK_LOCKED_EMAIL) {
        record('bloquee');
        return mockError(429, 'Too Many Attempts.', undefined, { 'retry-after': '900' });
      }
      if (!user || payload.password !== MOCK_PASSWORD) {
        record('echouee');
        return mockError(422, 'Identifiants incorrects.', { email: ['Identifiants incorrects.'] });
      }
      if (user.account_status !== 'actif') {
        record('echouee');
        return mockError(403, 'Ce compte est désactivé.');
      }
      record('reussie');
      writeMockSession({ userId: user.id, passwordChanged: false });
      return (await mockResponse(mockMeForUser(user, false))).data.data;
    }
    // Sanctum SPA : le cookie XSRF doit exister avant la connexion.
    await ensureCsrfCookie();
    const { data } = await http.post<ApiResponse<Me>>('/auth/login', payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    if (isMockMode()) {
      writeMockSession(null);
      await mockResponse(null);
      return;
    }
    await http.post('/auth/logout');
  },

  // En mode fictif, le rôle vient de la connexion fictive ou du sélecteur de développement.
  me: async (): Promise<Me> => {
    const { data } = isMockMode() ? await mockResponse(currentMockMe()) : await http.get<ApiResponse<Me>>('/auth/me');
    return data.data;
  },

  // L'API répond de la même façon que l'email existe ou non.
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    if (isMockMode()) {
      await mockResponse(null);
      return;
    }
    await http.post('/auth/forgot-password', payload);
  },

  // Lien expiré ou déjà utilisé : 422 sur `email` ou `token` (broker Laravel).
  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    if (isMockMode()) {
      if (payload.token === MOCK_EXPIRED_RESET_TOKEN) {
        return mockError(422, 'Ce lien de réinitialisation est invalide.', { token: ['Ce lien de réinitialisation est invalide.'] });
      }
      await mockResponse(null);
      return;
    }
    await http.post('/auth/reset-password', payload);
  },

  // Mode fictif : la modification reste en mémoire jusqu'au rechargement de la page.
  updateProfile: async (payload: ProfilePayload): Promise<Me> => {
    if (isMockMode()) {
      const me = currentMockMe();
      const user = mockUsers.find((candidate) => candidate.id === me.user.id);
      if (user) Object.assign(user, payload);
      return (await mockResponse({ ...me, user: { ...me.user, ...payload } })).data.data;
    }
    const { data } = await http.put<ApiResponse<Me>>('/auth/profile', payload);
    return data.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    if (isMockMode()) {
      if (payload.current_password !== MOCK_PASSWORD) {
        return mockError(422, 'Mot de passe actuel incorrect.', { current_password: ['Le mot de passe actuel est incorrect.'] });
      }
      const session = readMockSession();
      if (session) writeMockSession({ ...session, passwordChanged: true });
      await mockResponse(null);
      return;
    }
    await http.put('/auth/password', payload);
  },
};
