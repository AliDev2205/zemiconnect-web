import Link from 'next/link';
import { Plus } from 'lucide-react';
import PagePlaceholder from '@/components/layout/PagePlaceholder';
import ReadOnlyBanner from '@/components/layout/ReadOnlyBanner';
import { buttonClasses } from '@/components/ui/Button';

export interface DriverScreenProps {
  // Espace administration : consultation seule, aucune action métier.
  readOnly?: boolean;
  // Racine des liens (/gestion/conducteurs ou /administration/conducteurs).
  basePath: string;
}

// Liste des conducteurs, partagée par la gestion et l'administration (readOnly).
export default function DriverListScreen({ readOnly = false, basePath }: DriverScreenProps) {
  return (
    <PagePlaceholder
      title="Conducteurs"
      subtitle="Registre des conducteurs de taxi-moto"
      actions={
        !readOnly && (
          <Link href={`${basePath}/nouveau`} className={buttonClasses()}>
            <Plus size={18} aria-hidden />
            Nouveau conducteur
          </Link>
        )
      }
    >
      {readOnly && <ReadOnlyBanner />}
    </PagePlaceholder>
  );
}
