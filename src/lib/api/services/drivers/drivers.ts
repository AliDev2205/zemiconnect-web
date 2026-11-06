import { http } from '@/lib/api/http';
import { isMockMode, matchesSearch, mockError, mockResponse, paginate } from '@/lib/api/mock';
import { mockDrivers } from '@/mocks/drivers';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Driver, DriverFilters } from '@/types/driver';

export interface DriverPayload {
  first_name: string;
  last_name: string;
  phone?: string | null;
}

// Changement de statut : le motif est obligatoire pour suspendre ou archiver.
export interface DriverStatusPayload {
  status: Driver['status'];
  reason?: string;
}

export const driversService = {
  list: async (filters: DriverFilters = {}): Promise<Paginated<Driver>> => {
    const { data } = isMockMode()
      ? await mockResponse(
          paginate(
            mockDrivers.filter(
              (driver) =>
                (!filters.status || driver.status === filters.status) &&
                (!filters.compliance || driver.compliance === filters.compliance) &&
                matchesSearch(filters.search, driver.zc_number, driver.first_name, driver.last_name, driver.motorcycle?.plate_number),
            ),
            filters.page,
            filters.per_page,
          ),
        )
      : await http.get<ApiResponse<Paginated<Driver>>>('/drivers', { params: filters });
    return data.data;
  },

  get: async (id: string): Promise<Driver> => {
    if (isMockMode()) {
      const driver = mockDrivers.find((item) => item.id === id);
      return driver ? (await mockResponse(driver)).data.data : mockError(404, 'Conducteur introuvable.');
    }
    const { data } = await http.get<ApiResponse<Driver>>(`/drivers/${id}`);
    return data.data;
  },

  create: async (payload: DriverPayload): Promise<Driver> => {
    if (isMockMode()) return (await mockResponse({ ...mockDrivers[3], ...payload, id: `drv-${Date.now()}` })).data.data;
    const { data } = await http.post<ApiResponse<Driver>>('/drivers', payload);
    return data.data;
  },

  update: async (id: string, payload: DriverPayload): Promise<Driver> => {
    if (isMockMode()) {
      const driver = mockDrivers.find((item) => item.id === id);
      return driver ? (await mockResponse({ ...driver, ...payload })).data.data : mockError(404, 'Conducteur introuvable.');
    }
    const { data } = await http.put<ApiResponse<Driver>>(`/drivers/${id}`, payload);
    return data.data;
  },

  changeStatus: async (id: string, payload: DriverStatusPayload): Promise<Driver> => {
    if (isMockMode()) {
      const driver = mockDrivers.find((item) => item.id === id);
      return driver ? (await mockResponse({ ...driver, status: payload.status })).data.data : mockError(404, 'Conducteur introuvable.');
    }
    const { data } = await http.patch<ApiResponse<Driver>>(`/drivers/${id}/status`, payload);
    return data.data;
  },
};
