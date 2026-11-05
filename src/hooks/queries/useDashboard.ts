import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api/services/dashboard/dashboard';
import { dashboardKeys } from '@/lib/query/keys';

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: dashboardService.stats,
  });
}
