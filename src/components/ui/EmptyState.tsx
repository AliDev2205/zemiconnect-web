import React from 'react';
import clsx from 'clsx';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ title, message, icon, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-card bg-secondary text-primary" aria-hidden>
        {icon ?? <Inbox size={24} />}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {message && <p className="max-w-md text-sm text-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}
