import { http } from '@/lib/api/http';
import { isMockMode, matchesSearch, mockResponse, paginate } from '@/lib/api/mock';
import { normalizeZcNumber } from '@/lib/utils/format';
import { mockDrivers } from '@/mocks/drivers';
import { isEmptyRegistryDemo } from '@/mocks/gestion';
import { mockLogs } from '@/mocks/logs';
import type { ApiResponse, Paginated } from '@/types/api';
import type { LogEntry, LogFilters } from '@/types/log';

// Conducteur recherché par nom ou numéro ZemiConnect.
function matchesDriver(log: LogEntry, term: string | undefined): boolean {
  if (!term) return true;
  const driver = mockDrivers.find((item) => item.id === log.driver_id);
  if (!driver) return false;
  return matchesSearch(term, `${driver.first_name} ${driver.last_name}`) || (!!driver.zc_number && normalizeZcNumber(driver.zc_number).includes(normalizeZcNumber(term)));
}

/*
 * Endpoints supposés (lecture seule) :
 *   GET /logs?kind&actor&action&driver&start_date&end_date&page&per_page
 *   GET /logs/actors?kind     auteurs possibles, pour le filtre « Utilisateur »
 */
export const logsService = {
  list: async (filters: LogFilters = {}): Promise<Paginated<LogEntry>> => {
    if (!isMockMode()) {
      const { data } = await http.get<ApiResponse<Paginated<LogEntry>>>('/logs', { params: filters });
      return data.data;
    }
    const rows = isEmptyRegistryDemo()
      ? []
      : mockLogs.filter(
          (log) =>
            (!filters.kind || log.kind === filters.kind) &&
            (!filters.driver_id || log.driver_id === filters.driver_id) &&
            (!filters.actor || log.actor_name === filters.actor) &&
            (!filters.action || log.action === filters.action) &&
            (!filters.start_date || log.created_at.slice(0, 10) >= filters.start_date) &&
            (!filters.end_date || log.created_at.slice(0, 10) <= filters.end_date) &&
            matchesDriver(log, filters.driver) &&
            matchesSearch(filters.search, log.actor_name, log.resource_label, log.action),
        );
    return (await mockResponse(paginate(rows, filters.page, filters.per_page ?? 15))).data.data;
  },

  actors: async (kind?: LogFilters['kind']): Promise<string[]> => {
    if (!isMockMode()) {
      const { data } = await http.get<ApiResponse<string[]>>('/logs/actors', { params: { kind } });
      return data.data;
    }
    const names = mockLogs.filter((log) => !kind || log.kind === kind).map((log) => log.actor_name ?? 'Système');
    return (await mockResponse([...new Set(names)].sort((a, b) => a.localeCompare(b)))).data.data;
  },
};
