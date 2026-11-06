import { http } from '@/lib/api/http';
import { isMockMode, runMock } from '@/lib/api/mock';
import { gestionStore } from '@/mocks/gestion';
import type { ApiResponse } from '@/types/api';
import type { Document, DocumentType, FileLink } from '@/types/document';

export type DocumentOwner = { type: 'driver' | 'motorcycle'; id: string };

export interface DocumentPayload {
  type: DocumentType;
  number: string;
  issued_at: string;
  // Facultative, SAUF pour l'assurance. Ne jamais déduire une date absente.
  expires_at: string | null;
  file: File | null;
}

const ownerPath = (owner: DocumentOwner) => `/${owner.type === 'driver' ? 'drivers' : 'motorcycles'}/${owner.id}/documents`;

/*
 * Endpoints supposés :
 *   POST /drivers/{id}/documents | /motorcycles/{id}/documents   ajout ou renouvellement (multipart)
 *   GET  /drivers/{id}/documents/history | /motorcycles/{id}/documents/history
 *   GET  /documents/{id}/file   → { url, expires_at } : URL TEMPORAIRE (lien signé).
 * Aucun chemin public permanent n'est exposé au front.
 */
export const documentsService = {
  // Ajout ou renouvellement : le document actuel du même type passe dans l'historique.
  upload: async (owner: DocumentOwner, payload: DocumentPayload): Promise<Document> => {
    if (isMockMode()) return runMock(() => gestionStore.addDocument(owner, payload));
    const form = new FormData();
    form.append('type', payload.type);
    form.append('number', payload.number);
    form.append('issued_at', payload.issued_at);
    form.append('expires_at', payload.expires_at ?? '');
    if (payload.file) form.append('file', payload.file);
    const { data } = await http.post<ApiResponse<Document>>(ownerPath(owner), form);
    return data.data;
  },

  history: async (owner: DocumentOwner): Promise<Document[]> => {
    if (isMockMode()) return runMock(() => gestionStore.documentHistory(owner));
    const { data } = await http.get<ApiResponse<Document[]>>(`${ownerPath(owner)}/history`);
    return data.data;
  },

  fileLink: async (documentId: string): Promise<FileLink> => {
    if (isMockMode()) return runMock(() => gestionStore.fileLink(documentId));
    const { data } = await http.get<ApiResponse<FileLink>>(`/documents/${documentId}/file`);
    return data.data;
  },
};
