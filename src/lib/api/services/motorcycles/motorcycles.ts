import { http } from '@/lib/api/http';
import { isMockMode, matchesSearch, mockError, mockResponse, paginate } from '@/lib/api/mock';
import { mockMotorcycles } from '@/mocks/drivers';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Motorcycle, MotorcycleFilters } from '@/types/motorcycle';

export const motorcyclesService = {
  list: async (filters: MotorcycleFilters = {}): Promise<Paginated<Motorcycle>> => {
    const { data } = isMockMode()
      ? await mockResponse(
          paginate(
            mockMotorcycles.filter((moto) => matchesSearch(filters.search, moto.plate_number, moto.brand, moto.driver_name)),
            filters.page,
            filters.per_page,
          ),
        )
      : await http.get<ApiResponse<Paginated<Motorcycle>>>('/motorcycles', { params: filters });
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
};
