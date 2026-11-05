import clsx from 'clsx';
import { APP_NAME } from '@/lib/constants';

interface LogoProps {
  // onDark : texte blanc (barre latérale, barre agent).
  onDark?: boolean;
  compact?: boolean;
  className?: string;
}

// Le jaune zémidjan est réservé au logo, au bandeau du badge et au bouton Scanner.
export default function Logo({ onDark, compact, className }: LogoProps) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-field bg-accent text-base font-extrabold text-foreground"
        aria-hidden
      >
        Z
      </span>
      {!compact && (
        <span className={clsx('text-[17px] font-bold tracking-tight', onDark ? 'text-white' : 'text-primary')}>{APP_NAME}</span>
      )}
      {compact && <span className="sr-only">{APP_NAME}</span>}
    </span>
  );
}
