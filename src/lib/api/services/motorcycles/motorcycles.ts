import { http } from '@/lib/api/http';
import { isMockMode, mockError, mockResponse, runMock } from '@/lib/api/mock';
import { gestionStore } from '@/mocks/gestion';
import { mockMotorcycles } from '@/mocks/drivers';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Motorcycle, MotorcycleFilters, MotorcyclePayload } from '@/types/motorcycle';

/*
 * Endpoints supposés :
 *   GET  /motorcycles?search&unassigned&page&per_page
 *   POST /motorcycles     (422 si l'immatriculation existe déjà)
 *   GET  /motorcycles/{id}
 */
export const motorcyclesService = {
  list: async (filters: MotorcycleFilters = {}): Promise<Paginated<Motorcycle>> => {
    if (isMockMode()) return runMock(() => gestionStore.listMotorcycles(filters));
    const { data } = await http.get<ApiResponse<Paginated<Motorcycle>>>('/motorcycles', { params: filters });
    return data.data;
  },

  get: async (id: string): Promise<Motorcycle> => {
    if (isMockMode()) {
      const moto = mockMotorcycles.find((item) => item.id === id);
      return moto ? (await mockResponse(moto)).data.data : mockError(404, 'Moto introuvable.');
    }
    const { data } = await http.get<ApiResponse<Motorcycle>>(`/motorcycles/${id}`);
    return data.data;
  },

  create: async (payload: MotorcyclePayload): Promise<Motorcycle> => {
    if (isMockMode()) return runMock(() => gestionStore.createMotorcycle(payload));
    const { data } = await http.post<ApiResponse<Motorcycle>>('/motorcycles', payload);
    return data.data;
  },
};
