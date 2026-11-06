export function getInitials(name?: string): string {
  if (!name?.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function fullName(person: { first_name: string; last_name: string }): string {
  return `${person.first_name} ${person.last_name}`;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// Date courte française. Une date absente reste absente : « — ». Une date
// seule (2026-11-12, expiration, naissance) est lue en UTC : elle ne recule
// pas d'un jour selon le fuseau du téléphone.
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(DATE_ONLY.test(value) ? { timeZone: 'UTC' } : {}),
  });
}

// Numéro ZemiConnect saisi : espaces retirés, majuscules. AUCUNE validation de
// format (le format du numéro n'est pas arrêté) : la recherche reste exacte.
export function normalizeZcNumber(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

// Heure de Cotonou / Parakou (UTC+1, sans heure d'été).
export const BENIN_TIME_ZONE = 'Africa/Porto-Novo';

// « le 05/11/2026 à 10:42 », en heure locale du Bénin quel que soit le
// fuseau du serveur ou du téléphone.
export function formatBeninDateTime(date: Date): string {
  const day = date.toLocaleDateString('fr-FR', { timeZone: BENIN_TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = date.toLocaleTimeString('fr-FR', { timeZone: BENIN_TIME_ZONE, hour: '2-digit', minute: '2-digit' });
  return `le ${day} à ${time}`;
}

// PU2 : « Vérifié le 05/11/2026 à 10:42 ».
export function formatVerifiedAt(date: Date): string {
  return `Vérifié ${formatBeninDateTime(date)}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
