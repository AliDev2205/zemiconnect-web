import { http } from '@/lib/api/http';
import { isMockMode, mockResponse } from '@/lib/api/mock';
import { mockDashboard } from '@/mocks/logs';
import type { ApiResponse } from '@/types/api';
import type { DashboardStats } from '@/types/dashboard';

export const dashboardService = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = isMockMode()
      ? await mockResponse(mockDashboard)
      : await http.get<ApiResponse<DashboardStats>>('/dashboard');
    return data.data;
  },
};
