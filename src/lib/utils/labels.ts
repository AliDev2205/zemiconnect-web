import type { DocumentType, DocumentValidity } from '@/types/document';
import type { ComplianceStatus, DriverStatus } from '@/types/driver';
import type { QrStatus } from '@/types/qr';
import type { AccountStatus } from '@/types/user';

// Libellés d'affichage. Ne jamais employer « autorisé » / « non autorisé ».

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  actif: 'Actif',
  suspendu: 'Suspendu',
  en_attente: 'En attente',
  archive: 'Archivé',
};

export const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  conforme: 'Conforme',
  expire_bientot: 'Expire bientôt',
  non_conforme: 'Non conforme',
};

export const VALIDITY_LABELS: Record<DocumentValidity, string> = {
  valide: 'Valide',
  expire_bientot: 'Expire bientôt',
  expire: 'Expiré',
  manquant: 'Manquant',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  piece_identite: "Pièce d'identité",
  permis: 'Permis de conduire',
  droit_taxi: 'Droit de taxi',
  assurance: 'Assurance',
};

export const QR_STATUS_LABELS: Record<QrStatus, string> = {
  actif: 'Actif',
  revoque: 'Révoqué',
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  actif: 'Actif',
  desactive: 'Désactivé',
  archive: 'Archivé',
};

export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
