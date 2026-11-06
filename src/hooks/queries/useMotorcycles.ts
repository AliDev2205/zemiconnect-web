import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motorcyclesService } from '@/lib/api/services/motorcycles/motorcycles';
import { dashboardKeys, motorcyclesKeys } from '@/lib/query/keys';
import type { MotorcycleFilters, MotorcyclePayload } from '@/types/motorcycle';

export function useMotorcycles(filters: MotorcycleFilters = {}, enabled = true) {
  return useQuery({
    queryKey: motorcyclesKeys.list(filters),
    queryFn: () => motorcyclesService.list(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useMotorcycle(id: string) {
  return useQuery({
    queryKey: motorcyclesKeys.detail(id),
    queryFn: () => motorcyclesService.get(id),
    enabled: !!id,
  });
}

export function useCreateMotorcycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MotorcyclePayload) => motorcyclesService.create(payload),
    meta: { toast: false },
    onSuccess: () => Promise.all([motorcyclesKeys.all, dashboardKeys.stats].map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}
