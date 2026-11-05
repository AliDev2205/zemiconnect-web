import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  // En-tête bleu brume (fiches).
  tintedHeader?: boolean;
  padded?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Surface blanche bordée, rayon 12 px, sans ombre.
export default function Card({ title, subtitle, actions, tintedHeader, padded = true, className, children }: CardProps) {
  const hasHeader = title || subtitle || actions;
  return (
    <section className={clsx('overflow-hidden rounded-card border border-border bg-surface', className)}>
      {hasHeader && (
        <header
          className={clsx(
            'flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5',
            tintedHeader && 'bg-secondary',
          )}
        >
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children !== undefined && <div className={clsx(padded && 'p-5')}>{children}</div>}
    </section>
  );
}
