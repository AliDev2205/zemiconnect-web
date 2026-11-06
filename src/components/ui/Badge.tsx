import React from 'react';
import clsx from 'clsx';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'neutral-light' | 'primary';
export type BadgeAppearance = 'solid' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  // solid : fond teinté plein. outline : fond blanc, bordure colorée.
  appearance?: BadgeAppearance;
  icon?: React.ReactNode;
  dashed?: boolean;
  // lg : verdict de la fiche agent, lisible d'un coup d'œil en plein soleil.
  size?: BadgeSize;
  className?: string;
}

export type BadgeSize = 'md' | 'lg';

// Taille d'icône assortie, pour les badges d'état.
export const BADGE_ICON_SIZE: Record<BadgeSize, number> = { md: 14, lg: 20 };

const solid: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success border-success-soft',
  warning: 'bg-warning-soft text-warning border-warning-soft',
  danger: 'bg-danger-soft text-danger border-danger-soft',
  neutral: 'bg-neutral-soft text-neutral border-neutral-soft',
  'neutral-light': 'bg-background text-muted border-border',
  primary: 'bg-secondary text-primary border-secondary',
};

const outline: Record<BadgeTone, string> = {
  success: 'bg-surface text-success border-success',
  warning: 'bg-surface text-warning border-warning',
  danger: 'bg-surface text-danger border-danger',
  neutral: 'bg-surface text-neutral border-neutral',
  'neutral-light': 'bg-surface text-muted border-border',
  primary: 'bg-surface text-primary border-primary',
};

// Badge générique. La couleur ne porte jamais seule l'information : toujours
// un libellé, et une icône pour les badges d'état (StatusBadge, ComplianceBadge…).
export default function Badge({ children, tone = 'neutral', appearance = 'solid', icon, dashed, size = 'md', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center whitespace-nowrap font-semibold',
        size === 'lg' ? 'min-h-12 gap-1.5 rounded-field px-2 py-2 text-base leading-6' : 'gap-1 rounded px-2 py-0.5 text-xs leading-5',
        appearance === 'outline' ? (size === 'lg' ? 'border-2' : 'border-[1.5px]') : 'border',
        (appearance === 'outline' ? outline : solid)[tone],
        // Pointillés : bordure plus soutenue pour rester visible sur fond clair.
        dashed && 'border-dashed border-neutral!',
        className,
      )}
    >
      {icon && (
        <span className="flex shrink-0" aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
