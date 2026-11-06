'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { MoreHorizontal } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
}

interface MenuProps {
  items: MenuItem[];
  label?: string;
  className?: string;
}

// Menu « … » d'actions secondaires (Archiver…). Fermé au clic extérieur et à Échap.
export default function Menu({ items, label = 'Plus d’actions', className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-field border border-border bg-surface text-muted hover:text-foreground"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 min-w-48 overflow-hidden rounded-card border border-border bg-surface py-1">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={clsx(
                'flex h-10 w-full items-center gap-2.5 px-3 text-left text-sm font-medium hover:bg-secondary',
                item.tone === 'danger' ? 'text-danger' : 'text-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
