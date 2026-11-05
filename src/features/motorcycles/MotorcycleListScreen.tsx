import PagePlaceholder from '@/components/layout/PagePlaceholder';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';

export interface MotorcycleScreenProps {
  readOnly?: boolean;
  basePath: string;
}

// Liste des motos, partagée par la gestion et l'administration (readOnly).
export default function MotorcycleListScreen({ readOnly = false }: MotorcycleScreenProps) {
  return (
    <PagePlaceholder title="Motos" subtitle="Motos enregistrées et leur assurance">
      {readOnly && <ReadOnlyBanner />}
    </PagePlaceholder>
  );
}
