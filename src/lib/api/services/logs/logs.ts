import { http } from '@/lib/api/http';
import { isMockMode, matchesSearch, mockResponse, paginate } from '@/lib/api/mock';
import { isEmptyRegistryDemo } from '@/mocks/gestion';
import { mockLogs } from '@/mocks/logs';
import type { ApiResponse, Paginated } from '@/types/api';
import type { LogEntry, LogFilters } from '@/types/log';

// GET /logs?kind&search&driver_id&start_date&end_date&page&per_page
export const logsService = {
  list: async (filters: LogFilters = {}): Promise<Paginated<LogEntry>> => {
    const { data } = isMockMode()
      ? await mockResponse(
          paginate(
            isEmptyRegistryDemo()
              ? []
              : mockLogs.filter(
                  (log) =>
                    (!filters.kind || log.kind === filters.kind) &&
                    (!filters.driver_id || log.driver_id === filters.driver_id) &&
                    matchesSearch(filters.search, log.actor_name, log.resource_label, log.action),
                ),
            filters.page,
            filters.per_page,
          ),
        )
      : await http.get<ApiResponse<Paginated<LogEntry>>>('/logs', { params: filters });
    return data.data;
  },
};
