import { http } from '@/lib/api/http';
import { isMockMode, matchesSearch, mockResponse, paginate } from '@/lib/api/mock';
import { mockSettings } from '@/mocks/logs';
import { mockUsers } from '@/mocks/users';
import type { ApiResponse, PageFilters, Paginated } from '@/types/api';
import type { AppSettings } from '@/types/dashboard';
import type { User } from '@/types/user';

// Espace administration : gestionnaires et paramètres. Les autres données
// (conducteurs, motos, agents, journaux) passent par leurs services de domaine.
export const adminService = {
  listManagers: async (filters: PageFilters = {}): Promise<Paginated<User>> => {
    const { data } = isMockMode()
      ? await mockResponse(
          paginate(
            mockUsers.filter(
              (user) => user.role === 'gestionnaire' && matchesSearch(filters.search, user.first_name, user.last_name, user.email),
            ),
            filters.page,
            filters.per_page,
          ),
        )
      : await http.get<ApiResponse<Paginated<User>>>('/admin/managers', { params: filters });
    return data.data;
  },

  getSettings: async (): Promise<AppSettings> => {
    const { data } = isMockMode()
      ? await mockResponse(mockSettings)
      : await http.get<ApiResponse<AppSettings>>('/admin/settings');
    return data.data;
  },
};
