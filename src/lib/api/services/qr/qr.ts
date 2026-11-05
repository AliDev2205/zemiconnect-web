import { http } from '@/lib/api/http';
import { isMockMode, mockError, mockResponse } from '@/lib/api/mock';
import { mockQrCodes } from '@/mocks/drivers';
import type { ApiResponse } from '@/types/api';
import type { QrCode } from '@/types/qr';

export interface RevokeQrPayload {
  reason: string;
}

export const qrService = {
  // Historique des QR d'un conducteur (un seul actif à la fois).
  listForDriver: async (driverId: string): Promise<QrCode[]> => {
    const { data } = isMockMode()
      ? await mockResponse(mockQrCodes.filter((qr) => qr.driver_id === driverId))
      : await http.get<ApiResponse<QrCode[]>>(`/drivers/${driverId}/qr-codes`);
    return data.data;
  },

  // Révoque le QR actif et en émet un nouveau.
  regenerate: async (driverId: string, payload: RevokeQrPayload): Promise<QrCode> => {
    if (isMockMode()) {
      const current = mockQrCodes.find((qr) => qr.driver_id === driverId && qr.status === 'actif');
      if (!current) return mockError(404, 'Aucun QR actif pour ce conducteur.');
      return (await mockResponse({ ...current, id: `qr-${Date.now()}`, token: `${current.token}-2`, issued_at: new Date().toISOString() })).data.data;
    }
    const { data } = await http.post<ApiResponse<QrCode>>(`/drivers/${driverId}/qr-codes`, payload);
    return data.data;
  },
};
