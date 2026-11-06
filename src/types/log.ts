export type LogKind = 'audit' | 'consultation' | 'connexion';

// Code d'action de l'audit ; libellés dans lib/utils/labels.ts (AUDIT_ACTION_LABELS).
export type AuditAction =
  | 'driver.created'
  | 'driver.updated'
  | 'driver.photo_updated'
  | 'driver.validated'
  | 'driver.suspended'
  | 'driver.reactivated'
  | 'driver.archived'
  | 'document.added'
  | 'document.renewed'
  | 'assignment.changed'
  | 'motorcycle.created'
  | 'qr.generated'
  | 'qr.regenerated'
  | 'qr.revoked'
  | 'consultation.qr'
  | 'consultation.search'
  | 'auth.login';

export interface LogEntry {
  id: string;
  kind: LogKind;
  action: AuditAction;
  actor_name: string | null;
  actor_role: string | null;
  resource_type: 'driver' | 'motorcycle' | 'qr_code' | 'document' | null;
  // Identifiant et libellé de l'objet (lien vers sa fiche).
  resource_id: string | null;
  resource_label: string | null;
  // Conducteur concerné, pour le fil chronologique de sa fiche.
  driver_id: string | null;
  // Précision libre (« Assurance de la moto », « BB 4521 RB »…).
  detail: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  // Motif saisi lors d'une action sensible (suspension, révocation…).
  reason: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface LogFilters {
  page?: number;
  per_page?: number;
  kind?: LogKind;
  search?: string;
  driver_id?: string;
  start_date?: string;
  end_date?: string;
}
