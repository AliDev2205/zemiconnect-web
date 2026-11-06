import { useQuery } from '@tanstack/react-query';
import { agentDriversService } from '@/lib/api/services/agent/drivers';
import { agentDriversKeys } from '@/lib/query/keys';

// Chaque ouverture de fiche est une nouvelle consultation (enregistrée par
// l'API) : jamais de cache réutilisé, jamais de relance à la reprise du focus.
const consultation = { staleTime: 0, gcTime: 0, refetchOnWindowFocus: false, refetchOnReconnect: false } as const;

// AG3 par QR.
export function useAgentDriverByToken(token: string) {
  return useQuery({
    queryKey: agentDriversKeys.byToken(token),
    queryFn: () => agentDriversService.byToken(token),
    enabled: !!token,
    ...consultation,
  });
}

// AG3 par numéro ZemiConnect ou immatriculation.
export function useAgentDriverSearch(query: string) {
  return useQuery({
    queryKey: agentDriversKeys.search(query),
    queryFn: () => agentDriversService.search(query),
    enabled: query.trim().length > 0,
    ...consultation,
  });
}
