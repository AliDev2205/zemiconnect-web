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
  'motorcycle.updated': 'a modifié la moto',
  'motorcycle.archived': 'a archivé la moto',
  'agent.created': "a créé le compte de l'agent",
  'agent.updated': "a modifié le compte de l'agent",
  'agent.deactivated': "a désactivé le compte de l'agent",
  'agent.reactivated': "a réactivé le compte de l'agent",
  'agent.archived': "a archivé le compte de l'agent",
  'agent.reset_link_sent': 'a envoyé un lien de réinitialisation à',
  'manager.created': 'a créé le compte du gestionnaire',
  'manager.updated': 'a modifié le compte du gestionnaire',
  'manager.deactivated': 'a désactivé le compte du gestionnaire',
  'manager.reactivated': 'a réactivé le compte du gestionnaire',
  'manager.archived': 'a archivé le compte du gestionnaire',
  'manager.reset_link_sent': 'a envoyé un lien de réinitialisation à',
  'settings.updated': 'a modifié les paramètres',
  'qr.generated': 'a généré le QR de',
  'qr.regenerated': 'a régénéré le QR de',
  'qr.revoked': 'a révoqué le QR de',
  'consultation.qr': 'a consulté par QR la fiche de',
  'consultation.search': 'a consulté par recherche la fiche de',
  'auth.login': "s'est connecté",
};

// Nom court d'un type d'action (filtre « Type d'action » des journaux).
export const AUDIT_ACTION_NAMES: Record<AuditAction, string> = {
  'driver.created': 'Création de dossier',
  'driver.updated': "Modification d'identité",
  'driver.photo_updated': 'Changement de photo',
  'driver.validated': 'Validation de dossier',
  'driver.suspended': 'Suspension',
  'driver.reactivated': 'Réactivation',
  'driver.archived': 'Archivage de dossier',
  'document.added': 'Ajout de document',
  'document.renewed': 'Renouvellement de document',
  'assignment.changed': 'Affectation de moto',
  'motorcycle.created': 'Création de moto',
  'motorcycle.updated': 'Modification de moto',
  'motorcycle.archived': 'Archivage de moto',
  'agent.created': "Création de compte agent",
  'agent.updated': "Modification de compte agent",
  'agent.deactivated': "Désactivation d'agent",
  'agent.reactivated': "Réactivation d'agent",
  'agent.archived': "Archivage d'agent",
  'agent.reset_link_sent': 'Lien de réinitialisation',
  'manager.created': 'Création de compte gestionnaire',
  'manager.updated': 'Modification de compte gestionnaire',
  'manager.deactivated': 'Désactivation de gestionnaire',
  'manager.reactivated': 'Réactivation de gestionnaire',
  'manager.archived': 'Archivage de gestionnaire',
  'manager.reset_link_sent': 'Lien de réinitialisation (gestionnaire)',
  'settings.updated': 'Modification des paramètres',
  'qr.generated': 'Génération de QR',
  'qr.regenerated': 'Régénération de QR',
  'qr.revoked': 'Révocation de QR',
  'consultation.qr': 'Consultation par QR',
  'consultation.search': 'Consultation par recherche',
  'auth.login': 'Connexion',
};

export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
