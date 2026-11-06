import { http } from '@/lib/api/http';
import { isMockMode, runMock } from '@/lib/api/mock';
import { gestionStore } from '@/mocks/gestion';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Assignment, Motorcycle, MotorcycleFilters, MotorcyclePayload } from '@/types/motorcycle';

/*
 * Endpoints supposés :
 *   GET  /motorcycles?search&unassigned&page&per_page
 *   POST /motorcycles                (422 si l'immatriculation existe déjà)
 *   GET  /motorcycles/{id}
 *   PUT  /motorcycles/{id}
 *   POST /motorcycles/{id}/archive   (409 tant que la moto est affectée) ; aucune suppression
 *   GET  /motorcycles/{id}/assignments
 */
export const motorcyclesService = {
  list: async (filters: MotorcycleFilters = {}): Promise<Paginated<Motorcycle>> => {
    if (isMockMode()) return runMock(() => gestionStore.listMotorcycles(filters));
    const { data } = await http.get<ApiResponse<Paginated<Motorcycle>>>('/motorcycles', { params: filters });
    return data.data;
  },

  get: async (id: string): Promise<Motorcycle> => {
    if (isMockMode()) return runMock(() => gestionStore.getMotorcycle(id));
    const { data } = await http.get<ApiResponse<Motorcycle>>(`/motorcycles/${id}`);
    return data.data;
  },

  create: async (payload: MotorcyclePayload): Promise<Motorcycle> => {
    if (isMockMode()) return runMock(() => gestionStore.createMotorcycle(payload));
    const { data } = await http.post<ApiResponse<Motorcycle>>('/motorcycles', payload);
    return data.data;
  },

  update: async (id: string, payload: MotorcyclePayload): Promise<Motorcycle> => {
    if (isMockMode()) return runMock(() => gestionStore.updateMotorcycle(id, payload));
    const { data } = await http.put<ApiResponse<Motorcycle>>(`/motorcycles/${id}`, payload);
    return data.data;
  },

  archive: async (id: string): Promise<Motorcycle> => {
    if (isMockMode()) return runMock(() => gestionStore.archiveMotorcycle(id));
    const { data } = await http.post<ApiResponse<Motorcycle>>(`/motorcycles/${id}/archive`);
    return data.data;
  },

  assignments: async (id: string): Promise<Assignment[]> => {
    if (isMockMode()) return runMock(() => gestionStore.motorcycleAssignments(id));
    const { data } = await http.get<ApiResponse<Assignment[]>>(`/motorcycles/${id}/assignments`);
    return data.data;
  },
};
