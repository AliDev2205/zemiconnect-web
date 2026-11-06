// Fichiers acceptés pour les documents, le scan de la fiche papier et la
// photo. PROPOSITION TECHNIQUE, centralisée ici : à ajuster sur les règles de
// l'API. Le contrôle côté client n'est qu'un confort : l'API revérifie.
export const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const ACCEPTED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'] as const;
export const MAX_FILE_SIZE_MB = 5;
export const ACCEPTED_FILE_LABEL = `PDF, JPG ou PNG · ${MAX_FILE_SIZE_MB} Mo maximum`;

// Pour les photos : images seulement.
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;

export function fileAccept(types: readonly string[] = ACCEPTED_FILE_TYPES): string {
  return types.join(',');
}

// Message d'erreur, ou null si le fichier convient.
export function validateFile(file: File, types: readonly string[] = ACCEPTED_FILE_TYPES): string | null {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  const typeOk = types.includes(file.type) || (!file.type && (ACCEPTED_FILE_EXTENSIONS as readonly string[]).includes(extension));
  if (!typeOk) return types === ACCEPTED_IMAGE_TYPES ? 'Format non accepté : JPG ou PNG.' : 'Format non accepté : PDF, JPG ou PNG.';
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Fichier trop volumineux (${MAX_FILE_SIZE_MB} Mo maximum).`;
  return null;
}
