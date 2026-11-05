import { Archive, UserCheck, UserX } from 'lucide-react';
import { ACCOUNT_STATUS_LABELS } from '@/lib/utils/labels';
import type { AccountStatus } from '@/types/user';
import Badge, { BadgeTone } from './Badge';

const config: Record<AccountStatus, { tone: BadgeTone; Icon: typeof UserCheck }> = {
  actif: { tone: 'success', Icon: UserCheck },
  desactive: { tone: 'danger', Icon: UserX },
  archive: { tone: 'neutral', Icon: Archive },
};

// État d'un compte (gestionnaire, agent) : badge contour.
export default function AccountBadge({ status, className }: { status: AccountStatus; className?: string }) {
  const { tone, Icon } = config[status];
  return (
    <Badge tone={tone} appearance="outline" icon={<Icon size={14} />} className={className}>
      {ACCOUNT_STATUS_LABELS[status]}
    </Badge>
  );
}
