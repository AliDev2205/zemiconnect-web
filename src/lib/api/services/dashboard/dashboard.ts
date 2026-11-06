import { http } from '@/lib/api/http';
import { isMockMode, runMock } from '@/lib/api/mock';
import { EMPTY_DASHBOARD, gestionStore, isEmptyRegistryDemo } from '@/mocks/gestion';
import type { ApiResponse } from '@/types/api';
import type { DashboardStats } from '@/types/dashboard';

// GET /dashboard : compteurs et listes « À traiter » de l'espace gestion.
export const dashboardService = {
  stats: async (): Promise<DashboardStats> => {
    if (isMockMode()) return runMock(() => (isEmptyRegistryDemo() ? EMPTY_DASHBOARD : gestionStore.dashboard()));
    const { data } = await http.get<ApiResponse<DashboardStats>>('/dashboard');
    return data.data;
  },
};
