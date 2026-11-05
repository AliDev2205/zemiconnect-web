import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { motorcyclesService } from '@/lib/api/services/motorcycles/motorcycles';
import { motorcyclesKeys } from '@/lib/query/keys';
import type { MotorcycleFilters } from '@/types/motorcycle';

export function useMotorcycles(filters: MotorcycleFilters = {}) {
  return useQuery({
    queryKey: motorcyclesKeys.list(filters),
    queryFn: () => motorcyclesService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useMotorcycle(id: string) {
  return useQuery({
    queryKey: motorcyclesKeys.detail(id),
    queryFn: () => motorcyclesService.get(id),
    enabled: !!id,
  });
}
