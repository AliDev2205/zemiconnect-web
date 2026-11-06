import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { COMPLIANCE_LABELS } from '@/lib/utils/labels';
import type { ComplianceStatus } from '@/types/driver';
import Badge, { BADGE_ICON_SIZE, BadgeSize, BadgeTone } from './Badge';

const config: Record<ComplianceStatus, { tone: BadgeTone; Icon: typeof ShieldCheck }> = {
  conforme: { tone: 'success', Icon: ShieldCheck },
  expire_bientot: { tone: 'warning', Icon: ShieldAlert },
  non_conforme: { tone: 'danger', Icon: ShieldX },
};

interface Props {
  compliance: ComplianceStatus;
  size?: BadgeSize;
  className?: string;
}

// Conformité documentaire : badge CONTOUR avec bouclier. Distincte du statut.
export default function ComplianceBadge({ compliance, size = 'md', className }: Props) {
  const { tone, Icon } = config[compliance];
  return (
    <Badge tone={tone} appearance="outline" size={size} icon={<Icon size={BADGE_ICON_SIZE[size]} />} className={className}>
      {COMPLIANCE_LABELS[compliance]}
    </Badge>
  );
}
