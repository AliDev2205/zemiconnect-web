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
  | 'motorcycle.updated'
  | 'motorcycle.archived'
  | 'agent.created'
  | 'agent.updated'
  | 'agent.deactivated'
  | 'agent.reactivated'
  | 'agent.archived'
  | 'agent.reset_link_sent'
  | 'manager.created'
  | 'manager.updated'
  | 'manager.deactivated'
  | 'manager.reactivated'
  | 'manager.archived'
  | 'manager.reset_link_sent'
  | 'settings.updated'
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
  resource_type: 'driver' | 'motorcycle' | 'qr_code' | 'document' | 'agent' | 'manager' | 'settings' | null;
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
  // Journal des connexions (kind 'connexion') : email saisi, résultat, navigateur.
  login_email?: string | null;
  login_result?: LoginResult;
  user_agent?: string | null;
}

export type LoginResult = 'reussie' | 'echouee' | 'bloquee';

export interface LogFilters {
  page?: number;
  per_page?: number;
  kind?: LogKind;
  search?: string;
  driver_id?: string;
  // Nom de l'utilisateur auteur de l'action (journaux GE8).
  actor?: string;
  action?: AuditAction;
  // Rôle de l'auteur (journaux de l'administration).
  role?: 'admin' | 'gestionnaire' | 'agent';
  // Connexions : résultat.
  result?: LoginResult;
  // Conducteur concerné : nom ou numéro (recherche).
  driver?: string;
  start_date?: string;
  end_date?: string;
}
