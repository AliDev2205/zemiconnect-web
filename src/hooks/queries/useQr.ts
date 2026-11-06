import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QrReasonPayload, qrService } from '@/lib/api/services/qr/qr';
import { driversKeys, logsKeys, qrKeys } from '@/lib/query/keys';

export function useQrCodes(driverId: string) {
  return useQuery({
    queryKey: qrKeys.list({ driverId }),
    queryFn: () => qrService.listForDriver(driverId),
    enabled: !!driverId,
  });
}

// Aperçu du QR actif : image produite par l'API, affichée par une URL locale.
export function useQrPreview(driverId: string, qrId: string | undefined) {
  return useQuery({
    queryKey: [...qrKeys.detail(driverId), 'preview', qrId ?? null],
    queryFn: async () => URL.createObjectURL(await qrService.file(driverId, 'svg')),
    enabled: !!driverId && !!qrId,
    staleTime: Infinity,
  });
}

function useInvalidateQr() {
  const queryClient = useQueryClient();
  return () => Promise.all([qrKeys.all, driversKeys.all, logsKeys.all].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useRegenerateQr(driverId: string) {
  const invalidate = useInvalidateQr();
  return useMutation({ mutationFn: (payload: QrReasonPayload) => qrService.regenerate(driverId, payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useRevokeQr(driverId: string) {
  const invalidate = useInvalidateQr();
  return useMutation({ mutationFn: (payload: QrReasonPayload) => qrService.revoke(driverId, payload), meta: { toast: false }, onSuccess: invalidate });
}
