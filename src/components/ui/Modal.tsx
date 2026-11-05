'use client';

import React, { useId } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useOverlay } from './useOverlay';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  // Empêche la fermeture pendant un envoi.
  dismissible?: boolean;
}

const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }: ModalProps) {
  const titleId = useId();
  const close = () => dismissible && onClose();
  const panelRef = useOverlay(open, close);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-[rgba(19,33,43,0.6)]" onClick={close} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          'relative flex max-h-[90vh] w-full flex-col rounded-t-card border border-border bg-surface outline-none sm:rounded-card',
          widths[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {dismissible && (
            <button type="button" onClick={onClose} className="text-muted hover:text-foreground" aria-label="Fermer">
              <X size={20} />
            </button>
          )}
        </header>
        {children && <div className="overflow-y-auto px-5 py-4">{children}</div>}
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</footer>}
      </div>
    </div>
  );
}
