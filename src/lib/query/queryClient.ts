import { MutationCache, QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { mutationToastHandlers } from '@/lib/toast/mutationBridge';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    // Ne relance jamais les erreurs client (validation, session, droits, introuvable…).
    if (status && status >= 400 && status < 500) return false;
  }

  return true;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache(mutationToastHandlers),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
