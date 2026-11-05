import { publicHttp } from '@/lib/api/raw';
import { isMockMode, mockError, mockResponse } from '@/lib/api/mock';
import { findDriverByActiveToken, mockDrivers, normalizeLookup, toPublicProfile } from '@/mocks/drivers';
import type { ApiResponse } from '@/types/api';
import type { PublicDriverProfile } from '@/types/driver';

// Lectures publiques (passagers). Utilisables depuis un composant serveur :
// instance `publicHttp` sans cookie ni intercepteur, aucune redirection sur 401.
export const publicService = {
  // PU2 via QR : 404 si le jeton est inconnu ou révoqué.
  getByToken: async (token: string): Promise<PublicDriverProfile> => {
    if (isMockMode()) {
      const driver = findDriverByActiveToken(token);
      return driver ? (await mockResponse(toPublicProfile(driver))).data.data : mockError(404, 'QR non valide.');
    }
    const { data } = await publicHttp.get<ApiResponse<PublicDriverProfile>>(`/public/drivers/qr/${encodeURIComponent(token)}`);
    return data.data;
  },

  // PU2 par numéro ZemiConnect, transmis tel quel (format non arrêté).
  getByNumber: async (numero: string): Promise<PublicDriverProfile> => {
    if (isMockMode()) {
      const driver = mockDrivers.find((item) => normalizeLookup(item.zc_number) === normalizeLookup(numero));
      return driver ? (await mockResponse(toPublicProfile(driver))).data.data : mockError(404, 'Numéro introuvable.');
    }
    const { data } = await publicHttp.get<ApiResponse<PublicDriverProfile>>('/public/drivers', { params: { numero } });
    return data.data;
  },
};
