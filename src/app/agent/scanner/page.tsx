import type { Metadata } from 'next';
import QrScannerScreen from '@/features/agent/QrScannerScreen';

export const metadata: Metadata = { title: 'Scanner un QR' };

// AG2. qr-scanner n'est chargé que par cette page (import dynamique côté client).
export default function ScannerPage() {
  return <QrScannerScreen />;
}
