import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { rawHttp } from '@/lib/api/raw';
import { handleSessionFailure } from '@/lib/auth/sessionFailure';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Client central des espaces connectés (Sanctum en mode SPA, par cookie).
// - withCredentials : envoie le cookie de session Sanctum à l'API.
// - withXSRFToken : le front (localhost:3000) et l'API (localhost:8000) sont sur
//   des origines différentes en local ; sans cette option, axios ne recopie pas
//   le cookie XSRF-TOKEN dans l'en-tête X-XSRF-TOKEN.
export const http = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
  },
});

const WRITE_METHODS = ['post', 'put', 'patch', 'delete'];

// Le cookie XSRF n'est demandé qu'une fois, avant la première écriture (ou la
// connexion) ; les requêtes concurrentes partagent la même promesse.
let csrfPromise: Promise<void> | null = null;

export function ensureCsrfCookie(): Promise<void> {
  csrfPromise ??= rawHttp
    .get('/sanctum/csrf-cookie')
    .then(() => undefined)
    .catch((error) => {
      csrfPromise = null;
      throw error;
    });
  return csrfPromise;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _csrfRetry?: boolean;
}

http.interceptors.request.use(async (config) => {
  if (WRITE_METHODS.includes((config.method ?? 'get').toLowerCase())) {
    await ensureCsrfCookie();
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as RetriableConfig | undefined;

    // 419 : jeton CSRF expiré (session Laravel renouvelée). On redemande le
    // cookie et on rejoue la requête une seule fois.
    if (status === 419 && config && !config._csrfRetry) {
      config._csrfRetry = true;
      csrfPromise = null;
      await ensureCsrfCookie();
      return http(config);
    }

    // 401 : pas de rafraîchissement de jeton avec Sanctum, la session est perdue.
    // 403 compte désactivé : déconnexion immédiate. Retour à /connexion (avec
    // `retour` pour un 401), jamais depuis une page publique.
    handleSessionFailure(error);

    // 403, 422, 429… : normalisés par toApiError (lib/api/errors.ts) là où ils sont affichés.
    return Promise.reject(error);
  },
);
