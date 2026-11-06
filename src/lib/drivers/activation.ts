import type { ActivationItem } from '@/types/dashboard';
import type { Driver } from '@/types/driver';

// Éléments exigés pour valider un dossier (passage En attente → Actif). Ce
// n'est pas la conformité : un dossier validé peut être non conforme (droit de
// taxi absent, par exemple). L'API refait la vérification à la validation.
export const ACTIVATION_ITEMS: { id: ActivationItem; label: string; missing: string }[] = [
  { id: 'photo', label: 'Photo', missing: 'la photo' },
  { id: 'piece_identite', label: "Pièce d'identité", missing: "la pièce d'identité" },
  { id: 'permis', label: 'Permis de conduire', missing: 'le permis de conduire' },
  { id: 'moto', label: 'Moto affectée', missing: 'une moto affectée' },
];

export function activationChecklist(driver: Pick<Driver, 'photo_url' | 'documents' | 'motorcycle'>): Record<ActivationItem, boolean> {
  return {
    photo: !!driver.photo_url,
    piece_identite: driver.documents.some((document) => document.type === 'piece_identite'),
    permis: driver.documents.some((document) => document.type === 'permis'),
    moto: driver.motorcycle !== null,
  };
}

export function missingActivationItems(driver: Pick<Driver, 'photo_url' | 'documents' | 'motorcycle'>): ActivationItem[] {
  const checklist = activationChecklist(driver);
  return ACTIVATION_ITEMS.filter((item) => !checklist[item.id]).map((item) => item.id);
}

// « Il manque la photo et le permis de conduire. »
export function missingActivationSentence(missing: ActivationItem[]): string {
  const labels = ACTIVATION_ITEMS.filter((item) => missing.includes(item.id)).map((item) => item.missing);
  if (labels.length === 0) return '';
  const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`;
  return `Il manque ${list}.`;
}
