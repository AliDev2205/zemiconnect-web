import type { Document } from './document';
import type { Motorcycle } from './motorcycle';

export type DriverStatus = 'en_attente' | 'actif' | 'suspendu' | 'archive';

// Distincte du statut : un conducteur actif peut être non conforme.
export type ComplianceStatus = 'conforme' | 'expire_bientot' | 'non_conforme';

export interface Driver {
  id: string;
  // Numéro ZemiConnect (ex. ZC-482917). Format non arrêté : aucune validation côté front.
  zc_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  photo_url: string | null;
  status: DriverStatus;
  compliance: ComplianceStatus;
  motorcycle: Motorcycle | null;
  documents: Document[];
  created_at: string;
  updated_at: string;
}

export interface DriverFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: DriverStatus;
  compliance?: ComplianceStatus;
}

// Vue publique (PU2) : uniquement ce qu'un passager a le droit de voir.
export interface PublicDriverProfile {
  zc_number: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  status: DriverStatus;
  compliance: ComplianceStatus;
  motorcycle: { plate_number: string; brand: string | null; model: string | null; color: string | null } | null;
}
