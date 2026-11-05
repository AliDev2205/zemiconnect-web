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
}
