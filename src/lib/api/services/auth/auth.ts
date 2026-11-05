import { ensureCsrfCookie, http } from '@/lib/api/http';
import { isMockMode, mockError, mockResponse } from '@/lib/api/mock';
import { getRoleHint } from '@/lib/auth/session';
import { mockMeForRole, mockUsers } from '@/mocks/users';
import type { ApiResponse } from '@/types/api';
import type { Me } from '@/types/user';

export interface LoginPayload {
  email: string;
  password: string;
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

export const authService = {
  login: async (payload: LoginPayload): Promise<Me> => {
    if (isMockMode()) {
      const user = mockUsers.find((candidate) => candidate.email === payload.email);
      if (!user) return mockError(422, 'Identifiants incorrects.', { email: ['Identifiants incorrects.'] });
      return (await mockResponse(mockMeForRole(user.role))).data.data;
    }
    // Sanctum SPA : le cookie XSRF doit exister avant la connexion.
    await ensureCsrfCookie();
    const { data } = await http.post<ApiResponse<Me>>('/auth/login', payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    if (isMockMode()) {
      await mockResponse(null);
      return;
    }
    await http.post('/auth/logout');
  },

  // En mode fictif, le rôle vient du sélecteur de développement (cookie zc_role).
  me: async (): Promise<Me> => {
    const { data } = isMockMode()
      ? await mockResponse(mockMeForRole(getRoleHint() ?? 'admin'))
      : await http.get<ApiResponse<Me>>('/auth/me');
    return data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    if (isMockMode()) {
      await mockResponse(null, 'Si ce compte existe, un e-mail a été envoyé.');
      return;
    }
    await http.post('/auth/forgot-password', payload);
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    if (isMockMode()) {
      await mockResponse(null);
      return;
    }
    await http.post('/auth/reset-password', payload);
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    if (isMockMode()) {
      await mockResponse(null);
      return;
    }
    await http.put('/auth/password', payload);
  },
};
