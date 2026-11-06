import { Archive, Link2, Link2Off } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { Motorcycle } from '@/types/motorcycle';

// Statut d'une moto, déduit de son affectation : icône + libellé.
export default function MotorcycleStatusBadge({ moto }: { moto: Pick<Motorcycle, 'archived_at' | 'driver_id'> }) {
  if (moto.archived_at) {
    return (
      <Badge tone="neutral-light" icon={<Archive size={14} />}>
        Archivée
      </Badge>
    );
  }
  return moto.driver_id ? (
    <Badge tone="primary" icon={<Link2 size={14} />}>
      Affectée
    </Badge>
  ) : (
    <Badge tone="neutral" icon={<Link2Off size={14} />}>
      Sans conducteur
    </Badge>
  );
}
