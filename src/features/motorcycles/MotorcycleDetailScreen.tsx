import PagePlaceholder from '@/components/layout/PagePlaceholder';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import type { MotorcycleScreenProps } from './MotorcycleListScreen';

// Fiche moto, partagée par la gestion et l'administration (readOnly).
export default function MotorcycleDetailScreen({ id, readOnly = false, basePath }: MotorcycleScreenProps & { id: string }) {
  return (
    <PagePlaceholder title="Fiche moto" subtitle={`Identifiant ${id}`} back={{ href: basePath, label: 'Motos' }}>
      {readOnly && <ReadOnlyBanner />}
    </PagePlaceholder>
  );
}
