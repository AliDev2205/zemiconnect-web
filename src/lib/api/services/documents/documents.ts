import { http } from '@/lib/api/http';
import { isMockMode, mockResponse } from '@/lib/api/mock';
import { mockDrivers, mockMotorcycles } from '@/mocks/drivers';
import type { ApiResponse } from '@/types/api';
import type { Document, DocumentType } from '@/types/document';

export type DocumentOwner = { type: 'driver' | 'motorcycle'; id: string };

export interface DocumentUploadPayload {
  type: DocumentType;
  number?: string;
  issued_at?: string;
  // Facultatif : ne jamais déduire une date d'expiration absente.
  expires_at?: string | null;
  file: File;
}

const ownerPath = (owner: DocumentOwner) => `/${owner.type === 'driver' ? 'drivers' : 'motorcycles'}/${owner.id}/documents`;

export const documentsService = {
  list: async (owner: DocumentOwner): Promise<Document[]> => {
    if (isMockMode()) {
      const source = owner.type === 'driver' ? mockDrivers : mockMotorcycles;
      return (await mockResponse(source.find((item) => item.id === owner.id)?.documents ?? [])).data.data;
    }
    const { data } = await http.get<ApiResponse<Document[]>>(ownerPath(owner));
    return data.data;
  },

  // Envoi multipart : le fichier part avec ses métadonnées.
  upload: async (owner: DocumentOwner, payload: DocumentUploadPayload): Promise<Document> => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, value);
    });
    if (isMockMode()) {
      return (
        await mockResponse<Document>({
          id: `doc-${Date.now()}`,
          type: payload.type,
          owner_type: owner.type,
          owner_id: owner.id,
          number: payload.number ?? null,
          issued_at: payload.issued_at ?? null,
          expires_at: payload.expires_at ?? null,
          validity: 'valide',
          file_url: null,
          created_at: new Date().toISOString(),
        })
      ).data.data;
    }
    const { data } = await http.post<ApiResponse<Document>>(ownerPath(owner), form);
    return data.data;
  },
};
