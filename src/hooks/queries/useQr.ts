import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qrService, RevokeQrPayload } from '@/lib/api/services/qr/qr';
import { qrKeys } from '@/lib/query/keys';

export function useQrCodes(driverId: string) {
  return useQuery({
    queryKey: qrKeys.list({ driverId }),
    queryFn: () => qrService.listForDriver(driverId),
    enabled: !!driverId,
  });
}

export function useRegenerateQr(driverId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RevokeQrPayload) => qrService.regenerate(driverId, payload),
    meta: { toast: { success: 'Nouveau QR émis, l’ancien est révoqué.' } },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qrKeys.all }),
  });
}
