import type { Document, DocumentType, DocumentValidity } from '@/types/document';
import type { ComplianceStatus } from '@/types/driver';

/*
 * Calcul de la validité et de la conformité EN MODE FICTIF. En réel, c'est
 * l'API qui calcule ; le front se contente d'afficher. Règles :
 * - « expire bientôt » : expiration dans les 30 jours ;
 * - un document sans date d'expiration est valide (jamais « non conforme ») ;
 * - la conformité porte sur le permis, le droit de taxi et l'assurance de la
 *   moto ACTUELLE ; la pièce d'identité n'en fait pas partie ;
 * - la conformité ne touche jamais au statut (un document expiré ne suspend pas).
 */
export const EXPIRY_WARNING_DAYS = 30;

const DAY = 24 * 60 * 60 * 1000;

// Date du jour (AAAA-MM-JJ) et décalage en jours, pour des données fictives
// qui restent cohérentes quel que soit le jour où l'on lance l'application.
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function inDays(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
}

// Horodatage ISO complet, décalé de `days` jours (et d'une heure fixe).
export function atDaysAgo(days: number, hour = 9): string {
  const date = new Date(Date.now() - days * DAY);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function computeValidity(expiresAt: string | null): DocumentValidity {
  if (!expiresAt) return 'valide';
  const days = Math.floor((Date.parse(expiresAt) - Date.parse(todayIso())) / DAY);
  if (days < 0) return 'expire';
  if (days <= EXPIRY_WARNING_DAYS) return 'expire_bientot';
  return 'valide';
}

export const COMPLIANCE_TYPES: DocumentType[] = ['permis', 'droit_taxi', 'assurance'];

// `documents` : documents actuels du conducteur ET de sa moto actuelle.
export function computeCompliance(documents: Pick<Document, 'type' | 'expires_at'>[]): ComplianceStatus {
  const validities = COMPLIANCE_TYPES.map((type) => {
    const document = documents.find((item) => item.type === type);
    return document ? computeValidity(document.expires_at) : 'manquant';
  });
  if (validities.some((validity) => validity === 'manquant' || validity === 'expire')) return 'non_conforme';
  if (validities.includes('expire_bientot')) return 'expire_bientot';
  return 'conforme';
}
