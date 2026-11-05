// Fabrique de clés hiérarchiques (convention HealthBook) :
// keys.all invalide tout le domaine, keys.lists() toutes les listes quels que
// soient les filtres, keys.detail(id) un seul élément.

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function createCatalogKeys(resource: string) {
  const all = [resource] as const;
  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (filters: object) => [...all, 'list', filters] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id: string) => [...all, 'detail', id] as const,
  };
}

export const driversKeys = createCatalogKeys('drivers');
export const motorcyclesKeys = createCatalogKeys('motorcycles');
export const documentsKeys = createCatalogKeys('documents');
export const qrKeys = createCatalogKeys('qr-codes');
export const agentsKeys = createCatalogKeys('agents');
export const managersKeys = createCatalogKeys('managers');
export const logsKeys = createCatalogKeys('logs');
export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
};
export const settingsKeys = {
  all: ['settings'] as const,
};
export const controlsKeys = {
  byToken: (token: string) => ['controls', 'token', token] as const,
  search: (query: string) => ['controls', 'search', query] as const,
};
