import { AxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export interface ApiError {
  // null : aucune réponse (réseau coupé, serveur injoignable).
  status: number | null;
  message: string;
  errors?: Record<string, string[]>;
  // 429 : délai indiqué par l'en-tête Retry-After, en secondes.
  retryAfterSeconds?: number;
  // Code métier facultatif renvoyé par l'API (ex. ACCOUNT_DISABLED_CODE).
  code?: string;
}

// Contrat supposé : 403 { code: 'account_disabled' } quand le compte est
// désactivé pendant une session (à confirmer avec l'API).
export const ACCOUNT_DISABLED_CODE = 'account_disabled';

export function isAccountDisabledError(error: unknown): boolean {
  const apiError = toApiError(error);
  return apiError.status === 403 && apiError.code === ACCOUNT_DISABLED_CODE;
}

export const NETWORK_ERROR_MESSAGE = 'Connexion impossible, vérifiez votre réseau.';

// « dans 1 minute », « dans 15 minutes » (arrondi au-dessus, au moins 1).
export function retryAfterMinutesLabel(seconds: number | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

const DEFAULT_MESSAGES: Record<number, string> = {
  401: 'Votre session a expiré. Veuillez vous reconnecter.',
  403: "Vous n'avez pas les droits nécessaires pour cette action.",
  404: 'Élément introuvable.',
  419: 'Votre session a expiré. Rechargez la page.',
  429: 'Trop de tentatives. Patientez avant de réessayer.',
};

export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return { status: null, message: NETWORK_ERROR_MESSAGE };
    }

    const status = error.response.status;
    const data = error.response.data as { message?: string; errors?: Record<string, string[]>; code?: string } | undefined;

    // 422 : erreurs de validation Laravel champ par champ. Le message les
    // détaille pour le toast ; `errors` sert au report sur les champs (applyApiErrorsToForm).
    if (status === 422 && data?.errors && Object.keys(data.errors).length > 0) {
      return { status, message: Object.values(data.errors).flat().join('\n'), errors: data.errors };
    }

    if (status === 429) {
      const retryAfter = Number(error.response.headers?.['retry-after']);
      const retryAfterSeconds = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined;
      const delay = retryAfterMinutesLabel(retryAfterSeconds);
      return {
        status,
        message: delay ? `Trop de tentatives. Réessayez dans ${delay}.` : DEFAULT_MESSAGES[429],
        retryAfterSeconds,
      };
    }

    return {
      status,
      message: data?.message ?? DEFAULT_MESSAGES[status] ?? 'Une erreur est survenue.',
      errors: data?.errors,
      code: data?.code,
    };
  }

  return { status: null, message: 'Une erreur inattendue est survenue.' };
}

// Reporte les erreurs 422 de Laravel sur les champs React Hook Form.
// Les clés Laravel en notation pointée (documents.0.number) correspondent aux
// chemins RHF. Renvoie true si au moins un champ a été marqué.
export function applyApiErrorsToForm<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  const apiError = toApiError(error);
  if (apiError.status !== 422 || !apiError.errors) return false;

  Object.entries(apiError.errors).forEach(([field, messages], index) => {
    setError(field as Path<T>, { type: 'server', message: messages[0] }, { shouldFocus: index === 0 });
  });
  return true;
}
