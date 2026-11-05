'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScanLine } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';

// Gros bouton jaune « Scanner un QR », fixé en bas de l'écran agent
// (masqué sur l'écran de scan lui-même).
export default function AgentScanButton() {
  const pathname = usePathname();
  if (pathname === '/agent/scanner') return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md">
        <Link href="/agent/scanner" className={buttonClasses({ variant: 'accent', size: 'lg', fullWidth: true, className: 'text-lg' })}>
          <ScanLine size={24} aria-hidden />
          Scanner un QR
        </Link>
      </div>
    </div>
  );
}
