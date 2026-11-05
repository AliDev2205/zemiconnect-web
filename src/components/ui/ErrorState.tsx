'use client';

import React from 'react';
import clsx from 'clsx';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: React.ReactNode;
  icon?: React.ReactNode;
  onRetry?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export default function ErrorState({
  title = 'Une erreur est survenue',
  message,
  icon,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={clsx('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-card bg-danger-soft text-danger" aria-hidden>
        {icon ?? <AlertOctagon size={24} />}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {message && <p className="max-w-md text-sm text-muted">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" leftIcon={<RotateCcw size={16} />} onClick={onRetry}>
          Réessayer
        </Button>
      )}
      {action}
    </div>
  );
}
