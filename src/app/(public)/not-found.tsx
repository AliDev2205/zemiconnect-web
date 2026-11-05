import PublicNotFound from '@/features/public/PublicNotFound';

// PU3 pour les pages publiques, en particulier /v/[token] : QR inconnu,
// révoqué, conducteur en attente ou archivé. Rendu avec un vrai code 404.
export default function PublicNotFoundPage() {
  return <PublicNotFound variant="qr" />;
}
