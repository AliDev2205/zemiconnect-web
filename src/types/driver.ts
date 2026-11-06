import type { Document } from './document';
import type { Motorcycle } from './motorcycle';

export type DriverStatus = 'en_attente' | 'actif' | 'suspendu' | 'archive';

// Distincte du statut : un conducteur actif peut être non conforme. Un document
// expiré ne suspend JAMAIS le conducteur. Calculée par l'API sur le permis, le
// droit de taxi et l'assurance de la moto actuelle.
export type ComplianceStatus = 'conforme' | 'expire_bientot' | 'non_conforme';

export interface Driver {
  id: string;
  // Numéro ZemiConnect : attribué SEULEMENT à la validation (null avant).
  // Format non arrêté : aucune validation côté front.
  zc_number: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  // Identifiant du conducteur : facultatif, NON unique, sans format, distinct du NPI.
  driver_identifier: string | null;
  photo_url: string | null;
  // Scan de la fiche papier d'enregistrement, s'il a été déposé.
  has_paper_form: boolean;
  status: DriverStatus;
  compliance: ComplianceStatus;
  // Moto actuelle et début de l'affectation en cours.
  motorcycle: Motorcycle | null;
  assignment_started_at: string | null;
  // Structure gestionnaire (association, coopérative…), facultative.
  managing_structure: string | null;
  // Documents ACTUELS du conducteur (pièce d'identité, permis, droit de taxi).
  // L'assurance est portée par la moto. L'historique est à part (documentsService.history).
  documents: Document[];
  validated_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverFilters {
  page?: number;
  per_page?: number;
  // Nom, prénom, numéro, téléphone, identifiant du conducteur, immatriculation.
  search?: string;
  status?: DriverStatus;
  compliance?: ComplianceStatus;
  // Période d'enregistrement (AAAA-MM-JJ).
  registered_from?: string;
  registered_to?: string;
}

// Étape 1 de GE3 et Drawer « Modifier » de GE4.
export interface DriverIdentityPayload {
  last_name: string;
  first_name: string;
  birth_date: string;
  phone: string;
  address: string;
  driver_identifier: string | null;
}

// Doublon possible signalé à l'étape Identité (avertissement non bloquant).
export interface DuplicateMatch {
  id: string;
  name: string;
  zc_number: string | null;
  status: DriverStatus;
  reasons: ('phone' | 'identifier' | 'name')[];
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
