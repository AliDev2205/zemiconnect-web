import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin/admin';
import { managersKeys, settingsKeys } from '@/lib/query/keys';
import type { PageFilters } from '@/types/api';

export function useManagers(filters: PageFilters = {}) {
  return useQuery({
    queryKey: managersKeys.list(filters),
    queryFn: () => adminService.listManagers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: adminService.getSettings,
  });
}
