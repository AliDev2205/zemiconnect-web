// piece_identite, permis et droit_taxi appartiennent au conducteur ; assurance à la moto.
export type DriverDocumentType = 'piece_identite' | 'permis' | 'droit_taxi';
export type MotorcycleDocumentType = 'assurance';
export type DocumentType = DriverDocumentType | MotorcycleDocumentType;

// Calculée par l'API (en mode fictif : mocks/compliance.ts). `manquant` :
// aucun document fourni. `expire_bientot` : expiration dans les 30 jours.
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
  // Un fichier a été déposé. Son adresse n'est JAMAIS exposée ici : on la
  // demande à l'API au moment de l'ouvrir (URL temporaire, documentsService.fileUrl).
  has_file: boolean;
  // Renseigné quand un renouvellement a remplacé ce document (historique).
  superseded_at: string | null;
  created_at: string;
}

// URL temporaire d'un fichier, fournie par l'API (lien signé).
export interface FileLink {
  url: string;
  expires_at: string;
}
