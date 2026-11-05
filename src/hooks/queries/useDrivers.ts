import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DriverPayload, driversService, DriverStatusPayload } from '@/lib/api/services/drivers/drivers';
import { controlsKeys, driversKeys } from '@/lib/query/keys';
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

// Contrôle agent par QR (AG3).
export function useDriverControlByToken(token: string) {
  return useQuery({
    queryKey: controlsKeys.byToken(token),
    queryFn: () => driversService.controlByToken(token),
    enabled: !!token,
    staleTime: 0,
  });
}

// Contrôle agent par numéro ou immatriculation (AG3).
export function useDriverControlSearch(query: string) {
  return useQuery({
    queryKey: controlsKeys.search(query),
    queryFn: () => driversService.controlSearch({ query }),
    enabled: query.trim().length > 0,
    staleTime: 0,
  });
}
