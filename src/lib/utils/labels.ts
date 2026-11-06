import type { DocumentType, DocumentValidity } from '@/types/document';
import type { ComplianceStatus, DriverStatus } from '@/types/driver';
import type { AuditAction } from '@/types/log';
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

// Libellé complet d'un document, tel qu'affiché dans les listes de la gestion.
export const DOCUMENT_FULL_LABELS: Record<DocumentType, string> = {
  piece_identite: "Pièce d'identité",
  permis: 'Permis de conduire',
  droit_taxi: 'Droit de taxi',
  assurance: 'Assurance de la moto',
};

// Actions du journal, en phrase : « Aïcha TOKO a suspendu Rachidi BIO ».
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  'driver.created': 'a enregistré le dossier de',
  'driver.updated': "a modifié l'identité de",
  'driver.photo_updated': 'a changé la photo de',
  'driver.validated': 'a validé le dossier de',
  'driver.suspended': 'a suspendu',
  'driver.reactivated': 'a réactivé',
  'driver.archived': 'a archivé le dossier de',
  'document.added': 'a ajouté un document pour',
  'document.renewed': 'a renouvelé un document de',
  'assignment.changed': 'a affecté une moto à',
  'motorcycle.created': 'a enregistré la moto',
  'qr.generated': 'a généré le QR de',
  'qr.regenerated': 'a régénéré le QR de',
  'qr.revoked': 'a révoqué le QR de',
  'consultation.qr': 'a consulté par QR la fiche de',
  'consultation.search': 'a consulté par recherche la fiche de',
  'auth.login': "s'est connecté",
};

export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
