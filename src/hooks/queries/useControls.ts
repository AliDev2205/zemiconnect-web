import { useQuery } from '@tanstack/react-query';
import { controlsService } from '@/lib/api/services/controls/controls';
import { controlsKeys } from '@/lib/query/keys';

// Chaque ouverture de fiche est une nouvelle consultation (enregistrée par
// l'API) : jamais de cache réutilisé, jamais de relance à la reprise du focus.
const consultation = { staleTime: 0, gcTime: 0, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

// AG3 par QR.
export function useControlByToken(token: string) {
  return useQuery({
    queryKey: controlsKeys.byToken(token),
    queryFn: () => controlsService.byToken(token),
    enabled: !!token,
    ...consultation,
  });
}

// AG3 par numéro ZemiConnect ou immatriculation.
export function useControlSearch(query: string) {
  return useQuery({
    queryKey: controlsKeys.search(query),
    queryFn: () => controlsService.search(query),
    enabled: query.trim().length > 0,
    ...consultation,
  });
}
