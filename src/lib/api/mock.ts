import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import type { ApiResponse, Paginated } from '@/types/api';

// Mode fictif : actif quand NEXT_PUBLIC_API_MOCK=true. Lisible côté serveur et
// navigateur. Seuls les services le consultent ; pages et hooks l'ignorent.
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_API_MOCK === 'true';
}

const MOCK_DELAY_MS = 250;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Réponse fictive de même forme qu'une réponse axios de l'API : les services
// la déballent exactement comme la vraie (`const { data } = await …; return data.data`).
// La donnée est COPIÉE, comme après un passage par le réseau : le magasin
// fictif modifie ses objets sur place, et React Query ne verrait aucun
// changement s'il recevait deux fois la même référence.
export async function mockResponse<T>(payload: T, message = 'OK'): Promise<{ data: ApiResponse<T> }> {
  await wait(MOCK_DELAY_MS);
  return { data: { status: 'success', message, data: structuredClone(payload) } };
}

// Erreur fictive de même forme qu'une erreur axios : toApiError la traite comme une vraie.
// `responseHeaders` : par exemple { 'retry-after': '900' } pour un 429.
export async function mockError(
  status: number,
  message: string,
  errors?: Record<string, string[]>,
  responseHeaders: Record<string, string> = {},
  // Champs supplémentaires du corps de réponse (ex. { code: 'account_disabled' }).
  extra: Record<string, unknown> = {},
): Promise<never> {
  await wait(MOCK_DELAY_MS);
  const headers = new AxiosHeaders();
  const config = { headers };
  const response: AxiosResponse = {
    status,
    statusText: message,
    headers: responseHeaders,
    config,
    data: { status: 'error', message, errors, ...extra },
  };
  throw new AxiosError(message, String(status), config, null, response);
}

// Refus métier levé par le magasin fictif (mocks/gestion.ts) ; runMock le
// transforme en erreur axios, comme une vraie réponse 4xx de l'API.
export class MockApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

// Exécute une opération du magasin fictif et renvoie la même forme qu'un
// appel réel : la donnée déballée, ou une erreur axios (422, 404, 409…).
export async function runMock<T>(operation: () => T): Promise<T> {
  try {
    return (await mockResponse(operation())).data.data;
  } catch (error) {
    if (error instanceof MockApiError) return mockError(error.status, error.message, error.errors);
    throw error;
  }
}

// Erreur réseau fictive (aucune réponse), comme une coupure de connexion.
export async function mockNetworkError(): Promise<never> {
  await wait(MOCK_DELAY_MS);
  throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, { headers: new AxiosHeaders() }, null, undefined);
}

export function paginate<T>(items: T[], page = 1, perPage = 15): Paginated<T> {
  const lastPage = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), lastPage);
  return {
    data: items.slice((current - 1) * perPage, current * perPage),
    total: items.length,
    per_page: perPage,
    current_page: current,
    last_page: lastPage,
  };
}

export function matchesSearch(search: string | undefined, ...fields: (string | null | undefined)[]): boolean {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}
