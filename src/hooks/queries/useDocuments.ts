import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DocumentOwner, documentsService, DocumentUploadPayload } from '@/lib/api/services/documents/documents';
import { documentsKeys, driversKeys, motorcyclesKeys } from '@/lib/query/keys';

export function useDocuments(owner: DocumentOwner) {
  return useQuery({
    queryKey: documentsKeys.list(owner),
    queryFn: () => documentsService.list(owner),
    enabled: !!owner.id,
  });
}

export function useUploadDocument(owner: DocumentOwner) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentUploadPayload) => documentsService.upload(owner, payload),
    meta: { toast: { success: 'Document enregistré.' } },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all });
      // La conformité du propriétaire dépend de ses documents.
      queryClient.invalidateQueries({ queryKey: owner.type === 'driver' ? driversKeys.all : motorcyclesKeys.all });
    },
  });
}
