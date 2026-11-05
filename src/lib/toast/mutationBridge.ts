import { Mutation, MutationCache } from '@tanstack/react-query';
import { toApiError } from '@/lib/api/errors';
import { toast } from '@/lib/toast/store';

// MutationCacheConfig n'est pas exporté par le paquet : on le dérive du constructeur.
type MutationCacheConfig = NonNullable<ConstructorParameters<typeof MutationCache>[0]>;

export interface MutationToastMeta {
  success?: string | ((data: unknown) => string);
  error?: string;
}

// Type `useMutation({ meta: { toast: … } })` partout dans l'app.
// `toast: false` désactive le toast automatique (formulaires avec retour en ligne).
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      toast?: MutationToastMeta | false;
    };
  }
}

type AnyMutation = Mutation<unknown, unknown, unknown, unknown>;

// Câblé une fois dans le QueryClient : chaque mutation affiche un toast quand
// l'API a répondu, sans code supplémentaire dans les hooks.
export const mutationToastHandlers: Pick<MutationCacheConfig, 'onSuccess' | 'onError'> = {
  onSuccess: (data, _variables, _context, mutation) => {
    const config = (mutation as AnyMutation).options.meta?.toast;
    if (config === false) return;
    const message = typeof config?.success === 'function' ? config.success(data) : (config?.success ?? 'Opération réussie.');
    toast.success(message);
  },
  onError: (error, _variables, _context, mutation) => {
    const config = (mutation as AnyMutation).options.meta?.toast;
    if (config === false) return;
    const apiError = toApiError(error);
    // Une 422 détaille les champs à corriger : elle prime sur le message générique.
    toast.error(apiError.status === 422 && apiError.errors ? apiError.message : (config?.error ?? apiError.message));
  },
};
