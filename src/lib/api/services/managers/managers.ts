import { http } from '@/lib/api/http';
import { isMockMode, runMock } from '@/lib/api/mock';
import { ManagerFiltersInput, ManagerInput, managersStore } from '@/mocks/managers';
import type { ApiResponse, Paginated } from '@/types/api';
import type { User } from '@/types/user';

export type ManagerFilters = ManagerFiltersInput;
export type ManagerPayload = ManagerInput;

/*
 * Comptes gestionnaires (AD2), permission managers.manage (administrateur).
 *   GET   /admin/managers?search&page&per_page
 *   POST  /admin/managers                 création + email d'invitation (mot de passe provisoire)
 *   GET   /admin/managers/{id}
 *   PUT   /admin/managers/{id}
 *   PATCH /admin/managers/{id}/status     { status, reason } ; motif obligatoire pour désactiver
 *   POST  /admin/managers/{id}/archive    { reason } ; aucune suppression
 *   POST  /admin/managers/{id}/reset-link
 */
export const managersService = {
  list: async (filters: ManagerFilters = {}): Promise<Paginated<User>> => {
    if (isMockMode()) return runMock(() => managersStore.list(filters));
    const { data } = await http.get<ApiResponse<Paginated<User>>>('/admin/managers', { params: filters });
    return data.data;
  },

  get: async (id: string): Promise<User> => {
    if (isMockMode()) return runMock(() => managersStore.get(id));
    const { data } = await http.get<ApiResponse<User>>(`/admin/managers/${id}`);
    return data.data;
  },

  create: async (payload: ManagerPayload): Promise<User> => {
    if (isMockMode()) return runMock(() => managersStore.create(payload));
    const { data } = await http.post<ApiResponse<User>>('/admin/managers', payload);
    return data.data;
  },

  update: async (id: string, payload: ManagerPayload): Promise<User> => {
    if (isMockMode()) return runMock(() => managersStore.update(id, payload));
    const { data } = await http.put<ApiResponse<User>>(`/admin/managers/${id}`, payload);
    return data.data;
  },

  setStatus: async (id: string, status: 'actif' | 'desactive', reason: string | null): Promise<User> => {
    if (isMockMode()) return runMock(() => managersStore.setStatus(id, status, reason));
    const { data } = await http.patch<ApiResponse<User>>(`/admin/managers/${id}/status`, { status, reason });
    return data.data;
  },

  archive: async (id: string, reason: string): Promise<User> => {
    if (isMockMode()) return runMock(() => managersStore.archive(id, reason));
    const { data } = await http.post<ApiResponse<User>>(`/admin/managers/${id}/archive`, { reason });
    return data.data;
  },

  sendResetLink: async (id: string): Promise<void> => {
    if (isMockMode()) {
      await runMock(() => managersStore.sendResetLink(id));
      return;
    }
    await http.post(`/admin/managers/${id}/reset-link`);
  },
};
