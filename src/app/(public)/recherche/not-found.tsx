import PublicNotFound from '@/features/public/PublicNotFound';

// PU3 de la recherche par numéro : « Numéro introuvable », code HTTP 404.
export default function NumberNotFoundPage() {
  return <PublicNotFound variant="numero" />;
}
