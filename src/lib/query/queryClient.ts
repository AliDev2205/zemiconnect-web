import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { handleSessionFailure } from '@/lib/auth/sessionFailure';
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
    // Session perdue (401) ou compte désactivé : retour à /connexion. Doublon
    // volontaire avec l'intercepteur axios, pour couvrir le mode fictif ;
    // handleSessionFailure est idempotente.
    queryCache: new QueryCache({ onError: (error) => handleSessionFailure(error) }),
    mutationCache: new MutationCache({
      ...mutationToastHandlers,
      onError: (error, variables, context, mutation, mutationContext) => {
        if (handleSessionFailure(error)) return;
        mutationToastHandlers.onError?.(error, variables, context, mutation, mutationContext);
      },
    }),
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
