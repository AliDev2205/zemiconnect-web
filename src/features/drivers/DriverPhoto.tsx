import Image from 'next/image';
import clsx from 'clsx';
import { UserRound } from 'lucide-react';

interface Props {
  url: string | null;
  name: string;
  // Côté en pixels (photo carrée, recadrée à l'enregistrement).
  size: number;
  className?: string;
  rounded?: 'full' | 'card';
}

// Photo d'un conducteur, ou silhouette si elle manque. Une photo fraîchement
// recadrée (mode fictif) est une URL locale « blob: » : pas d'optimisation.
export default function DriverPhoto({ url, name, size, className, rounded = 'card' }: Props) {
  const shape = rounded === 'full' ? 'rounded-full' : 'rounded-field';
  return (
    <span
      className={clsx('relative inline-flex shrink-0 overflow-hidden border border-border bg-neutral-soft text-muted', shape, className)}
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image src={url} alt={`Photo de ${name}`} fill sizes={`${size}px`} className="object-cover" unoptimized={url.startsWith('blob:')} />
      ) : (
        <span className="flex h-full w-full items-center justify-center" role="img" aria-label="Photo manquante">
          <UserRound size={Math.max(16, Math.round(size * 0.5))} aria-hidden />
        </span>
      )}
    </span>
  );
}
