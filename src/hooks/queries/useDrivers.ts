import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AssignmentPayload, driversService, StatusPayload } from '@/lib/api/services/drivers/drivers';
import { dashboardKeys, driversKeys, logsKeys, motorcyclesKeys, qrKeys } from '@/lib/query/keys';
import type { DriverFilters, DriverIdentityPayload } from '@/types/driver';

export function useDrivers(filters: DriverFilters = {}) {
  return useQuery({
    queryKey: driversKeys.list(filters),
    queryFn: () => driversService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useDriver(id: string | null | undefined) {
  return useQuery({
    queryKey: driversKeys.detail(id ?? ''),
    queryFn: () => driversService.get(id!),
    enabled: !!id,
  });
}

// Doublons possibles (étape Identité). Avertissement non bloquant.
export function useDriverDuplicates(payload: Partial<DriverIdentityPayload>, excludeId?: string) {
  const enabled = !!(payload.phone || payload.driver_identifier || (payload.first_name && payload.last_name));
  return useQuery({
    queryKey: [...driversKeys.all, 'duplicates', payload, excludeId ?? null],
    queryFn: () => driversService.duplicates(payload, excludeId),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useDriverAssignments(id: string) {
  return useQuery({ queryKey: [...driversKeys.detail(id), 'assignments'], queryFn: () => driversService.assignments(id), enabled: !!id });
}

export function useDriverHistory(id: string) {
  return useQuery({ queryKey: [...driversKeys.detail(id), 'history'], queryFn: () => driversService.history(id), enabled: !!id });
}

// Toute écriture sur un dossier touche aussi le tableau de bord et les journaux.
function useInvalidateDriver() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: driversKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats }),
      queryClient.invalidateQueries({ queryKey: logsKeys.all }),
      queryClient.invalidateQueries({ queryKey: motorcyclesKeys.all }),
      queryClient.invalidateQueries({ queryKey: qrKeys.all }),
    ]);
}

// Les formulaires affichent leurs erreurs en ligne (422 sous les champs) :
// toast pour le succès seulement.
export function useCreateDriver() {
  const invalidate = useInvalidateDriver();
  return useMutation({
    mutationFn: ({ payload, paperForm }: { payload: DriverIdentityPayload; paperForm: File | null }) => driversService.create(payload, paperForm),
    meta: { toast: false },
    onSuccess: invalidate,
  });
}

export function useUpdateDriver(id: string) {
  const invalidate = useInvalidateDriver();
  return useMutation({
    mutationFn: ({ payload, paperForm }: { payload: DriverIdentityPayload; paperForm: File | null }) => driversService.update(id, payload, paperForm),
    meta: { toast: false },
    onSuccess: invalidate,
  });
}

export function useUploadDriverPhoto(id: string) {
  const invalidate = useInvalidateDriver();
  return useMutation({ mutationFn: (photo: Blob) => driversService.uploadPhoto(id, photo), meta: { toast: false }, onSuccess: invalidate });
}

export function useAssignMotorcycle(id: string) {
  const invalidate = useInvalidateDriver();
  return useMutation({ mutationFn: (payload: AssignmentPayload) => driversService.assign(id, payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useValidateDriver(id: string) {
  const invalidate = useInvalidateDriver();
  return useMutation({ mutationFn: () => driversService.validate(id), meta: { toast: false }, onSuccess: invalidate });
}

export function useChangeDriverStatus(id: string) {
  const invalidate = useInvalidateDriver();
  return useMutation({ mutationFn: (payload: StatusPayload) => driversService.changeStatus(id, payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useArchiveDriver(id: string) {
  const invalidate = useInvalidateDriver();
  return useMutation({ mutationFn: (reason: string) => driversService.archive(id, reason), meta: { toast: false }, onSuccess: invalidate });
}
