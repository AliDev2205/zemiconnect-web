import { http } from '@/lib/api/http';
import { isMockMode, matchesSearch, mockError, mockResponse, paginate } from '@/lib/api/mock';
import { mockUsers } from '@/mocks/users';
import type { ApiResponse, PageFilters, Paginated } from '@/types/api';
import type { User } from '@/types/user';

export type AgentFilters = PageFilters & { account_status?: User['account_status'] };

export interface AgentPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
}

const mockAgents = () => mockUsers.filter((user) => user.role === 'agent');

export const agentsService = {
  list: async (filters: AgentFilters = {}): Promise<Paginated<User>> => {
    const { data } = isMockMode()
      ? await mockResponse(
          paginate(
            mockAgents().filter(
              (user) =>
                (!filters.account_status || user.account_status === filters.account_status) &&
                matchesSearch(filters.search, user.first_name, user.last_name, user.email),
            ),
            filters.page,
            filters.per_page,
          ),
        )
      : await http.get<ApiResponse<Paginated<User>>>('/agents', { params: filters });
    return data.data;
  },

  get: async (id: string): Promise<User> => {
    if (isMockMode()) {
      const agent = mockAgents().find((user) => user.id === id);
      return agent ? (await mockResponse(agent)).data.data : mockError(404, 'Agent introuvable.');
    }
    const { data } = await http.get<ApiResponse<User>>(`/agents/${id}`);
    return data.data;
  },

  create: async (payload: AgentPayload): Promise<User> => {
    if (isMockMode()) {
      return (await mockResponse<User>({ ...mockAgents()[0], ...payload, phone: payload.phone ?? null, id: `usr-${Date.now()}`, must_change_password: true })).data.data;
    }
    const { data } = await http.post<ApiResponse<User>>('/agents', payload);
    return data.data;
  },
};
