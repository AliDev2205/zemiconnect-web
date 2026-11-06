import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { logsService } from '@/lib/api/services/logs/logs';
import { logsKeys } from '@/lib/query/keys';
import type { LogFilters } from '@/types/log';

export function useLogs(filters: LogFilters = {}) {
  return useQuery({
    queryKey: logsKeys.list(filters),
    queryFn: () => logsService.list(filters),
    placeholderData: keepPreviousData,
  });
}

// Auteurs possibles d'un journal, pour le filtre « Utilisateur ».
export function useLogActors(kind?: LogFilters['kind']) {
  return useQuery({
    queryKey: [...logsKeys.all, 'actors', kind ?? 'tous'],
    queryFn: () => logsService.actors(kind),
    staleTime: 5 * 60 * 1000,
  });
}
