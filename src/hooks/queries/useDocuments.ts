import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DocumentOwner, DocumentPayload, documentsService } from '@/lib/api/services/documents/documents';
import { dashboardKeys, documentsKeys, driversKeys, logsKeys, motorcyclesKeys } from '@/lib/query/keys';

export function useDocumentHistory(owner: DocumentOwner) {
  return useQuery({
    queryKey: documentsKeys.list({ ...owner, history: true }),
    queryFn: () => documentsService.history(owner),
    enabled: !!owner.id,
  });
}

// Ajout ou renouvellement. La conformité du conducteur en dépend : tout est rafraîchi.
export function useUploadDocument(owner: DocumentOwner) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentPayload) => documentsService.upload(owner, payload),
    meta: { toast: false },
    onSuccess: () =>
      Promise.all(
        [documentsKeys.all, driversKeys.all, motorcyclesKeys.all, dashboardKeys.stats, logsKeys.all].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
}
