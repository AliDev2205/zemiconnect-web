import { http } from '@/lib/api/http';
import { isMockMode, runMock, runMockWrite } from '@/lib/api/mock';
import { gestionStore } from '@/mocks/gestion';
import type { ApiResponse } from '@/types/api';
import type { QrCode, QrFileFormat } from '@/types/qr';

export interface QrReasonPayload {
  reason: string;
}

// Fichiers d'exemple du mode fictif (public/mocks/).
const MOCK_FILES: Record<QrFileFormat, string> = {
  png: '/mocks/qr-exemple.png',
  svg: '/mocks/qr-exemple.svg',
  pdf: '/mocks/badge-exemple.pdf',
};

/*
 * Endpoints supposés. Le PDF du badge et les images du QR sont PRODUITS PAR L'API :
 *   GET  /drivers/{id}/qr-codes                 historique (un seul actif)
 *   POST /drivers/{id}/qr-codes/regenerate      { reason } : l'ancien ne fonctionne plus
 *   POST /drivers/{id}/qr-codes/revoke          { reason }
 *   GET  /drivers/{id}/qr-codes/active.png | active.svg
 *   GET  /drivers/{id}/badge.pdf
 */
export const qrService = {
  listForDriver: async (driverId: string): Promise<QrCode[]> => {
    if (isMockMode()) return runMock(() => gestionStore.qrCodes(driverId));
    const { data } = await http.get<ApiResponse<QrCode[]>>(`/drivers/${driverId}/qr-codes`);
    return data.data;
  },

  regenerate: async (driverId: string, payload: QrReasonPayload): Promise<QrCode> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.regenerateQr(driverId, payload.reason));
    const { data } = await http.post<ApiResponse<QrCode>>(`/drivers/${driverId}/qr-codes/regenerate`, payload);
    return data.data;
  },

  revoke: async (driverId: string, payload: QrReasonPayload): Promise<QrCode> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.revokeQr(driverId, payload.reason));
    const { data } = await http.post<ApiResponse<QrCode>>(`/drivers/${driverId}/qr-codes/revoke`, payload);
    return data.data;
  },

  // Fichier du QR actif (png, svg) ou du badge (pdf), en Blob.
  file: async (driverId: string, format: QrFileFormat): Promise<Blob> => {
    if (isMockMode()) {
      const response = await fetch(MOCK_FILES[format]);
      return response.blob();
    }
    const path = format === 'pdf' ? `/drivers/${driverId}/badge.pdf` : `/drivers/${driverId}/qr-codes/active.${format}`;
    const { data } = await http.get<Blob>(path, { responseType: 'blob' });
    return data;
  },
};
