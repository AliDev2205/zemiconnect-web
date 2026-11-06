import { http } from '@/lib/api/http';
import { ACCOUNT_DISABLED_CODE } from '@/lib/api/errors';
import { isMockMode, mockError, mockNetworkError, mockResponse } from '@/lib/api/mock';
import { normalizeZcNumber } from '@/lib/utils/format';
import { findDriverByActiveToken, mockDrivers, toControlView } from '@/mocks/drivers';
import type { ApiResponse } from '@/types/api';
import type { DriverControl } from '@/types/control';
import type { Driver } from '@/types/driver';

// Jetons QR du mode fictif qui simulent les erreurs de l'espace agent (AG4).
export const MOCK_CONTROL_TRIGGERS = {
  'demo-session-expiree': () => mockError(401, 'Unauthenticated.'),
  'demo-desactive': () => mockError(403, 'Ce compte est désactivé.', undefined, {}, { code: ACCOUNT_DISABLED_CODE }),
  'demo-acces-refuse': () => mockError(403, 'This action is unauthorized.'),
  'demo-reseau': () => mockNetworkError(),
} as const;

function mockControl(driver: Driver | null | undefined, notFound: string): Promise<DriverControl> {
  return driver ? mockResponse(toControlView(driver)).then(({ data }) => data.data) : mockError(404, notFound);
}

/*
 * Consultation agent (AG3). L'API enregistre elle-même la consultation et
 * renvoie son horodatage (`consulted_at`). 404 : QR révoqué ou inconnu, ou
 * aucune correspondance exacte ; 403 : le compte connecté n'est pas agent.
 */
export const controlsService = {
  byToken: async (token: string): Promise<DriverControl> => {
    if (isMockMode()) {
      const trigger = MOCK_CONTROL_TRIGGERS[token as keyof typeof MOCK_CONTROL_TRIGGERS];
      if (trigger) return trigger();
      return mockControl(findDriverByActiveToken(token), 'QR non valide.');
    }
    const { data } = await http.get<ApiResponse<DriverControl>>(`/controls/qr/${encodeURIComponent(token)}`);
    return data.data;
  },

  // Recherche EXACTE par numéro ZemiConnect ou immatriculation, normalisée
  // (espaces retirés, majuscules), sans validation de format.
  search: async (query: string): Promise<DriverControl> => {
    const needle = normalizeZcNumber(query);
    if (isMockMode()) {
      if (needle === 'HORS-LIGNE') return mockNetworkError();
      const driver = mockDrivers.find(
        (item) =>
          normalizeZcNumber(item.zc_number) === needle ||
          (item.motorcycle && normalizeZcNumber(item.motorcycle.plate_number) === needle),
      );
      return mockControl(driver, 'Aucun conducteur ne correspond.');
    }
    const { data } = await http.get<ApiResponse<DriverControl>>('/controls/search', { params: { q: needle } });
    return data.data;
  },
};
