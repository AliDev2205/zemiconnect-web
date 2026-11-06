import type { Document } from './document';

export interface Motorcycle {
  id: string;
  plate_number: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  chassis_number: string | null;
  // Conducteur actuellement rattaché, s'il y en a un.
  driver_id: string | null;
  driver_name: string | null;
  // Documents ACTUELS de la moto (assurance).
  documents: Document[];
  archived_at: string | null;
  created_at: string;
}

export interface MotorcycleFilters {
  page?: number;
  per_page?: number;
  search?: string;
  // Motos sans conducteur seulement (choix d'une moto à affecter).
  unassigned?: boolean;
}

export interface MotorcyclePayload {
  plate_number: string;
  brand: string;
  model: string | null;
  color: string | null;
  year: number | null;
  chassis_number: string | null;
}

// Affectation d'une moto à un conducteur. Une seule en cours à la fois
// (ended_at null) ; un changement clôture la précédente.
export interface Assignment {
  id: string;
  driver_id: string;
  driver_name: string;
  motorcycle_id: string;
  plate_number: string;
  started_at: string;
  ended_at: string | null;
  reason: string | null;
}
