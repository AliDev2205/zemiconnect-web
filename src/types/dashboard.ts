import type { DocumentType } from './document';
import type { ComplianceStatus, DriverStatus } from './driver';

// Ligne du bloc « À traiter » (GE1).
export interface TodoItem {
  driver_id: string;
  driver_name: string;
  // Document en cause ; null pour un dossier en attente.
  document_type: DocumentType | null;
  // Expiration du document, ou date de création du dossier en attente.
  date: string | null;
  // Dossier en attente : éléments encore manquants pour la validation.
  missing?: ActivationItem[];
}

export type ActivationItem = 'photo' | 'piece_identite' | 'permis' | 'moto';

// GET /dashboard (espace gestion).
export interface DashboardStats {
  drivers_total: number;
  drivers_by_status: Record<DriverStatus, number>;
  // Conducteurs ACTIFS seulement, par conformité.
  active_by_compliance: Record<ComplianceStatus, number>;
  motorcycles_total: number;
  motorcycles_unassigned: number;
  agents_active: number;
  todo: {
    expired: TodoItem[];
    expiring: TodoItem[];
    pending: TodoItem[];
  };
}

export interface AppSettings {
  public_domain: string;
  expiry_warning_days: number;
}
