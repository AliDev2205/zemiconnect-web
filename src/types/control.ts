import type { DocumentType, DocumentValidity } from './document';
import type { ComplianceStatus, DriverStatus } from './driver';

// Vue agent (AG3) : réponse de GET /controls/qr/{token} et /controls/search.
// Documents en TEXTE seulement : ce type ne contient volontairement aucune URL
// de fichier ni identifiant interne de document.
export interface ControlDocument {
  type: DocumentType;
  number: string | null;
  issued_at: string | null;
  // null : le document n'expire pas. Ne jamais inventer de date.
  expires_at: string | null;
  // Calculée par l'API (« expire bientôt » = dans les 30 jours).
  validity: DocumentValidity;
}

export interface ControlMotorcycle {
  plate_number: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  chassis_number: string | null;
}

export interface DriverControl {
  zc_number: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  // Identifiant du conducteur (pièce, registre…), s'il est renseigné.
  driver_identifier: string | null;
  status: DriverStatus;
  // Calculée par l'API sur le permis, le droit de taxi et l'assurance de la moto actuelle.
  compliance: ComplianceStatus;
  motorcycle: ControlMotorcycle | null;
  // Documents fournis ; un type absent de la liste est affiché « Manquant ».
  documents: ControlDocument[];
  // Horodatage de la consultation, enregistrée par l'API elle-même.
  consulted_at: string;
}
