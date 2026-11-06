import { http } from '@/lib/api/http';
import { isMockMode, paginate, runMock, runMockWrite } from '@/lib/api/mock';
import { gestionStore, isEmptyRegistryDemo } from '@/mocks/gestion';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Driver, DriverFilters, DriverIdentityPayload, DuplicateMatch } from '@/types/driver';
import type { LogEntry } from '@/types/log';
import type { Assignment } from '@/types/motorcycle';

// Choix d'une moto pour un conducteur : une moto SANS conducteur.
export interface AssignmentPayload {
  motorcycle_id: string;
  // Date de début (AAAA-MM-JJ) et motif : obligatoires pour un changement de moto.
  started_at?: string;
  reason?: string;
}

export interface StatusPayload {
  status: 'actif' | 'suspendu';
  reason: string;
}

// Identité + scan facultatif de la fiche papier : envoi multipart.
function identityForm(payload: DriverIdentityPayload, paperForm: File | null): FormData {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => form.append(key, value ?? ''));
  if (paperForm) form.append('paper_form', paperForm);
  return form;
}

/*
 * Endpoints supposés (à aligner sur l'API) :
 *   GET    /drivers?search&status&compliance&registered_from&registered_to&page&per_page
 *   GET    /drivers/duplicates?phone&driver_identifier&first_name&last_name&exclude
 *   POST   /drivers                       création En attente (fin de l'étape Identité)
 *   GET    /drivers/{id}
 *   POST   /drivers/{id}?_method=PUT      identité (multipart)
 *   POST   /drivers/{id}/photo            photo recadrée (multipart)
 *   POST   /drivers/{id}/assignment       affectation ou changement de moto
 *   GET    /drivers/{id}/assignments
 *   POST   /drivers/{id}/validate         numéro ZemiConnect + QR
 *   PATCH  /drivers/{id}/status           suspendre / réactiver (motif)
 *   POST   /drivers/{id}/archive          archivage (motif) ; aucune suppression
 *   GET    /drivers/{id}/history          audit + consultations des agents
 */
export const driversService = {
  list: async (filters: DriverFilters = {}): Promise<Paginated<Driver>> => {
    if (isMockMode()) return runMock(() => (isEmptyRegistryDemo() ? paginate<Driver>([], 1, 10) : gestionStore.listDrivers(filters)));
    const { data } = await http.get<ApiResponse<Paginated<Driver>>>('/drivers', { params: filters });
    return data.data;
  },

  get: async (id: string): Promise<Driver> => {
    if (isMockMode()) return runMock(() => gestionStore.getDriver(id));
    const { data } = await http.get<ApiResponse<Driver>>(`/drivers/${id}`);
    return data.data;
  },

  duplicates: async (payload: Partial<DriverIdentityPayload>, excludeId?: string): Promise<DuplicateMatch[]> => {
    if (isMockMode()) return runMock(() => gestionStore.duplicates(payload, excludeId));
    const { data } = await http.get<ApiResponse<DuplicateMatch[]>>('/drivers/duplicates', { params: { ...payload, exclude: excludeId } });
    return data.data;
  },

  create: async (payload: DriverIdentityPayload, paperForm: File | null = null): Promise<Driver> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.createDriver(payload, paperForm));
    const { data } = await http.post<ApiResponse<Driver>>('/drivers', identityForm(payload, paperForm));
    return data.data;
  },

  update: async (id: string, payload: DriverIdentityPayload, paperForm: File | null = null): Promise<Driver> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.updateDriver(id, payload, paperForm));
    const { data } = await http.post<ApiResponse<Driver>>(`/drivers/${id}?_method=PUT`, identityForm(payload, paperForm));
    return data.data;
  },

  // Photo déjà recadrée au carré (JPEG).
  uploadPhoto: async (id: string, photo: Blob): Promise<Driver> => {
    // Mode fictif : l'image reste dans le navigateur (URL locale).
    if (isMockMode()) return runMockWrite(() => gestionStore.setPhoto(id, URL.createObjectURL(photo)));
    const form = new FormData();
    form.append('photo', photo, 'photo.jpg');
    const { data } = await http.post<ApiResponse<Driver>>(`/drivers/${id}/photo`, form);
    return data.data;
  },

  assign: async (id: string, payload: AssignmentPayload): Promise<Driver> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.assign(id, payload));
    const { data } = await http.post<ApiResponse<Driver>>(`/drivers/${id}/assignment`, payload);
    return data.data;
  },

  assignments: async (id: string): Promise<Assignment[]> => {
    if (isMockMode()) return runMock(() => gestionStore.assignments(id));
    const { data } = await http.get<ApiResponse<Assignment[]>>(`/drivers/${id}/assignments`);
    return data.data;
  },

  // 422 { errors: { activation: [...] } } si un élément manque.
  validate: async (id: string): Promise<Driver> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.validate(id));
    const { data } = await http.post<ApiResponse<Driver>>(`/drivers/${id}/validate`);
    return data.data;
  },

  changeStatus: async (id: string, payload: StatusPayload): Promise<Driver> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.setStatus(id, payload.status, payload.reason));
    const { data } = await http.patch<ApiResponse<Driver>>(`/drivers/${id}/status`, payload);
    return data.data;
  },

  archive: async (id: string, reason: string): Promise<Driver> => {
    if (isMockMode()) return runMockWrite(() => gestionStore.archive(id, reason));
    const { data } = await http.post<ApiResponse<Driver>>(`/drivers/${id}/archive`, { reason });
    return data.data;
  },

  history: async (id: string): Promise<LogEntry[]> => {
    if (isMockMode()) return runMock(() => gestionStore.history(id));
    const { data } = await http.get<ApiResponse<LogEntry[]>>(`/drivers/${id}/history`);
    return data.data;
  },
};
