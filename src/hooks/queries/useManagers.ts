import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ManagerFilters, ManagerPayload, managersService } from '@/lib/api/services/managers/managers';
import { SettingsPayload, settingsService } from '@/lib/api/services/settings/settings';
import { dashboardKeys, logsKeys, managersKeys, settingsKeys } from '@/lib/query/keys';

export function useManagers(filters: ManagerFilters = {}) {
  return useQuery({ queryKey: managersKeys.list(filters), queryFn: () => managersService.list(filters), placeholderData: keepPreviousData });
}

export function useManager(id: string | null) {
  return useQuery({ queryKey: managersKeys.detail(id ?? ''), queryFn: () => managersService.get(id!), enabled: !!id });
}

function useInvalidateManagers() {
  const queryClient = useQueryClient();
  return () => Promise.all([managersKeys.all, dashboardKeys.stats, logsKeys.all].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

// Formulaires et modales affichent leurs erreurs en ligne : pas de toast automatique.
export function useCreateManager() {
  const invalidate = useInvalidateManagers();
  return useMutation({ mutationFn: (payload: ManagerPayload) => managersService.create(payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useUpdateManager(id: string) {
  const invalidate = useInvalidateManagers();
  return useMutation({ mutationFn: (payload: ManagerPayload) => managersService.update(id, payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useSetManagerStatus(id: string) {
  const invalidate = useInvalidateManagers();
  return useMutation({
    mutationFn: ({ status, reason }: { status: 'actif' | 'desactive'; reason: string | null }) => managersService.setStatus(id, status, reason),
    meta: { toast: false },
    onSuccess: invalidate,
  });
}

export function useArchiveManager(id: string) {
  const invalidate = useInvalidateManagers();
  return useMutation({ mutationFn: (reason: string) => managersService.archive(id, reason), meta: { toast: false }, onSuccess: invalidate });
}

export function useSendManagerResetLink(id: string) {
  const invalidate = useInvalidateManagers();
  return useMutation({ mutationFn: () => managersService.sendResetLink(id), meta: { toast: false }, onSuccess: invalidate });
}

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: settingsService.get });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettingsPayload) => settingsService.update(payload),
    meta: { toast: false },
    onSuccess: () => Promise.all([settingsKeys.all, logsKeys.all].map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}
