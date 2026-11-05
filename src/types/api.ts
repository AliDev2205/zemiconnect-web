// Enveloppe de réponse commune de l'API Laravel (même forme que HealthBook) :
// les services la déballent et ne renvoient que `data` aux hooks.
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

// Pagination Laravel renvoyée par les listes.
export interface Paginated<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// Filtres communs aux listes paginées.
export interface PageFilters {
  page?: number;
  per_page?: number;
  search?: string;
}
