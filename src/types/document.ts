// piece_identite, permis et droit_taxi appartiennent au conducteur ; assurance à la moto.
export type DriverDocumentType = 'piece_identite' | 'permis' | 'droit_taxi';
export type MotorcycleDocumentType = 'assurance';
export type DocumentType = DriverDocumentType | MotorcycleDocumentType;

// Calculée par l'API. `manquant` : aucun document fourni.
export type DocumentValidity = 'valide' | 'expire_bientot' | 'expire' | 'manquant';

export interface Document {
  id: string;
  type: DocumentType;
  owner_type: 'driver' | 'motorcycle';
  owner_id: string;
  number: string | null;
  issued_at: string | null;
  // Certains documents n'expirent pas : null est une valeur légitime, à ne jamais inventer.
  expires_at: string | null;
  validity: DocumentValidity;
  file_url: string | null;
  created_at: string;
}
