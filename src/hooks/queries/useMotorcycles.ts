import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motorcyclesService } from '@/lib/api/services/motorcycles/motorcycles';
import { dashboardKeys, driversKeys, logsKeys, motorcyclesKeys } from '@/lib/query/keys';
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

export function useMotorcycleAssignments(id: string) {
  return useQuery({ queryKey: [...motorcyclesKeys.detail(id), 'assignments'], queryFn: () => motorcyclesService.assignments(id), enabled: !!id });
}

// Une moto est vue depuis la fiche de son conducteur : tout est rafraîchi.
function useInvalidateMotorcycles() {
  const queryClient = useQueryClient();
  return () => Promise.all([motorcyclesKeys.all, driversKeys.all, dashboardKeys.stats, logsKeys.all].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useCreateMotorcycle() {
  const invalidate = useInvalidateMotorcycles();
  return useMutation({ mutationFn: (payload: MotorcyclePayload) => motorcyclesService.create(payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useUpdateMotorcycle(id: string) {
  const invalidate = useInvalidateMotorcycles();
  return useMutation({ mutationFn: (payload: MotorcyclePayload) => motorcyclesService.update(id, payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useArchiveMotorcycle(id: string) {
  const invalidate = useInvalidateMotorcycles();
  return useMutation({ mutationFn: () => motorcyclesService.archive(id), meta: { toast: false }, onSuccess: invalidate });
}
