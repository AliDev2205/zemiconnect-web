import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DriverPayload, driversService, DriverStatusPayload } from '@/lib/api/services/drivers/drivers';
import { driversKeys } from '@/lib/query/keys';
import type { DriverFilters } from '@/types/driver';

export function useDrivers(filters: DriverFilters = {}) {
  return useQuery({
    queryKey: driversKeys.list(filters),
    queryFn: () => driversService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: driversKeys.detail(id),
    queryFn: () => driversService.get(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DriverPayload) => driversService.create(payload),
    meta: { toast: { success: 'Conducteur enregistré.' } },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: driversKeys.lists() }),
  });
}

export function useUpdateDriver(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DriverPayload) => driversService.update(id, payload),
    meta: { toast: { success: 'Conducteur mis à jour.' } },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: driversKeys.all }),
  });
}

export function useChangeDriverStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DriverStatusPayload) => driversService.changeStatus(id, payload),
    meta: { toast: { success: 'Statut mis à jour.' } },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: driversKeys.all }),
  });
}
