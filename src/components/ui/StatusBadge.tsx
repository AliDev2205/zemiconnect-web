import { Archive, Ban, CheckCircle2, Clock } from 'lucide-react';
import { DRIVER_STATUS_LABELS } from '@/lib/utils/labels';
import type { DriverStatus } from '@/types/driver';
import Badge, { BadgeTone } from './Badge';

const config: Record<DriverStatus, { tone: BadgeTone; Icon: typeof CheckCircle2 }> = {
  actif: { tone: 'success', Icon: CheckCircle2 },
  suspendu: { tone: 'danger', Icon: Ban },
  en_attente: { tone: 'neutral', Icon: Clock },
  archive: { tone: 'neutral-light', Icon: Archive },
};

// Statut du conducteur : badge PLEIN. Toujours affiché à côté du ComplianceBadge.
export default function StatusBadge({ status, className }: { status: DriverStatus; className?: string }) {
  const { tone, Icon } = config[status];
  return (
    <Badge tone={tone} appearance="solid" icon={<Icon size={14} />} className={className}>
      {DRIVER_STATUS_LABELS[status]}
    </Badge>
  );
}
