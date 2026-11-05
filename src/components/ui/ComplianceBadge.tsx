import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { COMPLIANCE_LABELS } from '@/lib/utils/labels';
import type { ComplianceStatus } from '@/types/driver';
import Badge, { BadgeTone } from './Badge';

const config: Record<ComplianceStatus, { tone: BadgeTone; Icon: typeof ShieldCheck }> = {
  conforme: { tone: 'success', Icon: ShieldCheck },
  expire_bientot: { tone: 'warning', Icon: ShieldAlert },
  non_conforme: { tone: 'danger', Icon: ShieldX },
};

// Conformité documentaire : badge CONTOUR avec bouclier. Distincte du statut.
export default function ComplianceBadge({ compliance, className }: { compliance: ComplianceStatus; className?: string }) {
  const { tone, Icon } = config[compliance];
  return (
    <Badge tone={tone} appearance="outline" icon={<Icon size={14} />} className={className}>
      {COMPLIANCE_LABELS[compliance]}
    </Badge>
  );
}
