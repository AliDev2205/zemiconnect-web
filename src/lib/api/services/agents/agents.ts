import { http } from '@/lib/api/http';
import { isMockMode, runMock } from '@/lib/api/mock';
import { AgentFiltersInput, AgentInput, agentsStore } from '@/mocks/agents';
import type { ApiResponse, Paginated } from '@/types/api';
import type { User } from '@/types/user';

export type AgentFilters = AgentFiltersInput;
export type AgentPayload = AgentInput;

/*
 * Endpoints supposés (comptes des agents de contrôle) :
 *   GET   /agents?search&account_status&page&per_page
 *   POST  /agents                    création + email d'invitation
 *   GET   /agents/{id}
 *   PUT   /agents/{id}
 *   PATCH /agents/{id}/status        { status: 'actif' | 'desactive' } ; désactivé = déconnecté
 *   POST  /agents/{id}/archive       aucune suppression
 *   POST  /agents/{id}/reset-link    lien de réinitialisation par email
 */
export const agentsService = {
  list: async (filters: AgentFilters = {}): Promise<Paginated<User>> => {
    if (isMockMode()) return runMock(() => agentsStore.list(filters));
    const { data } = await http.get<ApiResponse<Paginated<User>>>('/agents', { params: filters });
    return data.data;
  },

  get: async (id: string): Promise<User> => {
    if (isMockMode()) return runMock(() => agentsStore.get(id));
    const { data } = await http.get<ApiResponse<User>>(`/agents/${id}`);
    return data.data;
  },

  create: async (payload: AgentPayload): Promise<User> => {
    if (isMockMode()) return runMock(() => agentsStore.create(payload));
    const { data } = await http.post<ApiResponse<User>>('/agents', payload);
    return data.data;
  },

  update: async (id: string, payload: AgentPayload): Promise<User> => {
    if (isMockMode()) return runMock(() => agentsStore.update(id, payload));
    const { data } = await http.put<ApiResponse<User>>(`/agents/${id}`, payload);
    return data.data;
  },

  setStatus: async (id: string, status: 'actif' | 'desactive'): Promise<User> => {
    if (isMockMode()) return runMock(() => agentsStore.setStatus(id, status));
    const { data } = await http.patch<ApiResponse<User>>(`/agents/${id}/status`, { status });
    return data.data;
  },

  archive: async (id: string): Promise<User> => {
    if (isMockMode()) return runMock(() => agentsStore.archive(id));
    const { data } = await http.post<ApiResponse<User>>(`/agents/${id}/archive`);
    return data.data;
  },

  sendResetLink: async (id: string): Promise<void> => {
    if (isMockMode()) {
      await runMock(() => agentsStore.sendResetLink(id));
      return;
    }
    await http.post(`/agents/${id}/reset-link`);
  },
};
