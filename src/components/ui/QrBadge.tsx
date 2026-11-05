import { QrCode, ScanLine } from 'lucide-react';
import { QR_STATUS_LABELS } from '@/lib/utils/labels';
import type { QrStatus } from '@/types/qr';
import Badge from './Badge';

// État d'un QR : Actif ou Révoqué.
export default function QrBadge({ status, className }: { status: QrStatus; className?: string }) {
  return (
    <Badge
      tone={status === 'actif' ? 'success' : 'danger'}
      appearance="solid"
      icon={status === 'actif' ? <QrCode size={14} /> : <ScanLine size={14} />}
      className={className}
    >
      QR {QR_STATUS_LABELS[status].toLowerCase()}
    </Badge>
  );
}
