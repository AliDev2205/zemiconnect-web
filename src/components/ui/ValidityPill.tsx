import { AlertTriangle, CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { VALIDITY_LABELS } from '@/lib/utils/labels';
import type { DocumentValidity } from '@/types/document';
import Badge, { BadgeTone } from './Badge';

const config: Record<DocumentValidity, { tone: BadgeTone; Icon: typeof CheckCircle2 }> = {
  valide: { tone: 'success', Icon: CheckCircle2 },
  expire_bientot: { tone: 'warning', Icon: AlertTriangle },
  expire: { tone: 'danger', Icon: XCircle },
  manquant: { tone: 'neutral-light', Icon: CircleDashed },
};

// Validité d'un document. « Manquant » : bord en pointillés.
export default function ValidityPill({ validity, className }: { validity: DocumentValidity; className?: string }) {
  const { tone, Icon } = config[validity];
  return (
    <Badge
      tone={tone}
      appearance="solid"
      dashed={validity === 'manquant'}
      icon={<Icon size={14} />}
      className={className}
    >
      {VALIDITY_LABELS[validity]}
    </Badge>
  );
}
