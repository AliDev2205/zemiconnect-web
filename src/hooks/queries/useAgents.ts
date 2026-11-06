import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgentFilters, AgentPayload, agentsService } from '@/lib/api/services/agents/agents';
import { agentsKeys, dashboardKeys, logsKeys } from '@/lib/query/keys';

export function useAgents(filters: AgentFilters = {}) {
  return useQuery({
    queryKey: agentsKeys.list(filters),
    queryFn: () => agentsService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAgent(id: string | null) {
  return useQuery({
    queryKey: agentsKeys.detail(id ?? ''),
    queryFn: () => agentsService.get(id!),
    enabled: !!id,
  });
}

// Les formulaires et les modales affichent leurs erreurs en ligne : pas de toast automatique.
function useInvalidateAgents() {
  const queryClient = useQueryClient();
  return () => Promise.all([agentsKeys.all, dashboardKeys.stats, logsKeys.all].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useCreateAgent() {
  const invalidate = useInvalidateAgents();
  return useMutation({ mutationFn: (payload: AgentPayload) => agentsService.create(payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useUpdateAgent(id: string) {
  const invalidate = useInvalidateAgents();
  return useMutation({ mutationFn: (payload: AgentPayload) => agentsService.update(id, payload), meta: { toast: false }, onSuccess: invalidate });
}

export function useSetAgentStatus(id: string) {
  const invalidate = useInvalidateAgents();
  return useMutation({ mutationFn: (status: 'actif' | 'desactive') => agentsService.setStatus(id, status), meta: { toast: false }, onSuccess: invalidate });
}

export function useArchiveAgent(id: string) {
  const invalidate = useInvalidateAgents();
  return useMutation({ mutationFn: () => agentsService.archive(id), meta: { toast: false }, onSuccess: invalidate });
}

export function useSendAgentResetLink(id: string) {
  const invalidate = useInvalidateAgents();
  return useMutation({ mutationFn: () => agentsService.sendResetLink(id), meta: { toast: false }, onSuccess: invalidate });
}
