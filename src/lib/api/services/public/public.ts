import { publicHttp } from '@/lib/api/raw';
import { isMockMode, mockError, mockNetworkError, mockResponse } from '@/lib/api/mock';
import { normalizeZcNumber } from '@/lib/utils/format';
import { findDriverByActiveToken, mockDrivers, toPublicProfile } from '@/mocks/drivers';
import type { ApiResponse } from '@/types/api';
import type { Driver, PublicDriverProfile } from '@/types/driver';

// Numéros de démonstration du mode fictif qui simulent une erreur de l'API.
export const MOCK_PUBLIC_TRIGGERS = { tooManyRequests: 'TROP', network: 'HORS-LIGNE' } as const;

// Même réponse 404 pour un jeton inconnu, un QR révoqué, un conducteur en
// attente ou archivé : la page publique ne doit donner aucun indice.
async function mockPublicProfile(driver: Driver | null | undefined, message: string): Promise<PublicDriverProfile> {
  const profile = driver ? toPublicProfile(driver) : null;
  return profile ? (await mockResponse(profile)).data.data : mockError(404, message);
}

// Lectures publiques (passagers). Utilisables depuis un composant serveur :
// instance `publicHttp` sans cookie ni intercepteur, aucune redirection sur 401.
export const publicService = {
  // PU2 via QR : 404 si le jeton est inconnu ou révoqué, ou le conducteur ni actif ni suspendu.
  getByToken: async (token: string): Promise<PublicDriverProfile> => {
    if (isMockMode()) return mockPublicProfile(findDriverByActiveToken(token), 'QR non valide.');
    const { data } = await publicHttp.get<ApiResponse<PublicDriverProfile>>(`/public/drivers/qr/${encodeURIComponent(token)}`);
    return data.data;
  },

  // PU2 par numéro ZemiConnect : recherche exacte sur le numéro normalisé
  // (espaces retirés, majuscules), sans validation de format.
  getByNumber: async (numero: string): Promise<PublicDriverProfile> => {
    const normalized = normalizeZcNumber(numero);
    if (isMockMode()) {
      if (normalized === MOCK_PUBLIC_TRIGGERS.tooManyRequests) {
        return mockError(429, 'Too Many Attempts.', undefined, { 'retry-after': '120' });
      }
      if (normalized === MOCK_PUBLIC_TRIGGERS.network) return mockNetworkError();
      const driver = mockDrivers.find((item) => normalizeZcNumber(item.zc_number ?? '') === normalized);
      return mockPublicProfile(driver, 'Numéro introuvable.');
    }
    const { data } = await publicHttp.get<ApiResponse<PublicDriverProfile>>('/public/drivers', { params: { numero: normalized } });
    return data.data;
  },
};
