export type QrStatus = 'actif' | 'revoque';

export interface QrCode {
  id: string;
  driver_id: string;
  // Jeton opaque porté par l'URL publique /v/[token].
  token: string;
  public_url: string;
  status: QrStatus;
  issued_at: string;
  revoked_at: string | null;
  // Motif saisi à la révocation (ou « Dossier archivé », « Régénération »).
  revoke_reason: string | null;
}

// Fichiers du QR actif produits par l'API (et le badge PDF).
export type QrFileFormat = 'png' | 'svg' | 'pdf';
