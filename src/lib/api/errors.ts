import { AxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export interface ApiError {
  status: number | null;
  message: string;
  errors?: Record<string, string[]>;
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
      return { status: null, message: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
    }

    const status = error.response.status;
    const data = error.response.data as { message?: string; errors?: Record<string, string[]> } | undefined;

    // 422 : erreurs de validation Laravel champ par champ. Le message les
    // détaille pour le toast ; `errors` sert au report sur les champs (applyApiErrorsToForm).
    if (status === 422 && data?.errors && Object.keys(data.errors).length > 0) {
      return { status, message: Object.values(data.errors).flat().join('\n'), errors: data.errors };
    }

    if (status === 429) {
      const retryAfter = Number(error.response.headers?.['retry-after']);
      return {
        status,
        message: Number.isFinite(retryAfter) && retryAfter > 0
          ? `Trop de tentatives. Réessayez dans ${retryAfter} s.`
          : DEFAULT_MESSAGES[429],
      };
    }

    return {
      status,
      message: data?.message ?? DEFAULT_MESSAGES[status] ?? 'Une erreur est survenue.',
      errors: data?.errors,
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
