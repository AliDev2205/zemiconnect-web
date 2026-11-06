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
  documents: Document[];
  created_at: string;
}

export interface MotorcycleFilters {
  page?: number;
  per_page?: number;
  search?: string;
}
