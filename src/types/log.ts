export type LogKind = 'audit' | 'consultation' | 'connexion';

export interface LogEntry {
  id: string;
  kind: LogKind;
  action: string;
  actor_name: string | null;
  actor_role: string | null;
  resource_type: string | null;
  resource_label: string | null;
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
  start_date?: string;
  end_date?: string;
}
