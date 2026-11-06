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
  address: string | null;
  birth_date: string | null;
  driver_identifier: string | null;
  photo_url: string | null;
  status: DriverStatus;
  compliance: ComplianceStatus;
  motorcycle: Motorcycle | null;
  // Structure gestionnaire (association, coopérative…), facultative.
  managing_structure: string | null;
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

// Statuts visibles par un passager. En attente et archivé ne sont jamais
// renvoyés par l'API publique : ils donnent la même réponse 404 qu'un QR inconnu.
export type PublicDriverStatus = Extract<DriverStatus, 'actif' | 'suspendu'>;

// Vue publique (PU2) : UNIQUEMENT ce qu'un passager a le droit de voir.
// Volontairement absents : identifiant interne, téléphone, adresse, date de
// naissance, documents, conformité. Ne pas les ajouter.
export interface PublicDriverProfile {
  zc_number: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  status: PublicDriverStatus;
  motorcycle: { plate_number: string; brand: string | null; color: string | null } | null;
  // Structure qui gère le conducteur, si elle est renseignée.
  managing_structure: string | null;
}
