import PagePlaceholder from '@/components/layout/PagePlaceholder';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import type { DriverScreenProps } from './DriverListScreen';

// Fiche conducteur, partagée par la gestion et l'administration (readOnly).
// Onglets prévus : Identité, Documents, Moto, QR et badge, Historique et audit.
export default function DriverDetailScreen({ id, readOnly = false, basePath }: DriverScreenProps & { id: string }) {
  return (
    <PagePlaceholder title="Fiche conducteur" subtitle={`Identifiant ${id}`} back={{ href: basePath, label: 'Conducteurs' }}>
      {readOnly && <ReadOnlyBanner />}
    </PagePlaceholder>
  );
}
