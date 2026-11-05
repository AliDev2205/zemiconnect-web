import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgentFilters, AgentPayload, agentsService } from '@/lib/api/services/agents/agents';
import { agentsKeys } from '@/lib/query/keys';

export function useAgents(filters: AgentFilters = {}) {
  return useQuery({
    queryKey: agentsKeys.list(filters),
    queryFn: () => agentsService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: agentsKeys.detail(id),
    queryFn: () => agentsService.get(id),
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AgentPayload) => agentsService.create(payload),
    meta: { toast: { success: 'Agent créé. Un mot de passe provisoire lui a été envoyé.' } },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentsKeys.lists() }),
  });
}
