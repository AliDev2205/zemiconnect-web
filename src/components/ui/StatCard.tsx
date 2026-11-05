import React from 'react';
import clsx from 'clsx';
import Skeleton from './Skeleton';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export default function StatCard({ label, value, icon, hint, isLoading, className }: StatCardProps) {
  return (
    <div className={clsx('flex flex-col gap-2 rounded-card border border-border bg-surface p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted">{label}</span>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-field bg-secondary text-primary" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      {isLoading ? <Skeleton className="h-8 w-20" /> : <span className="tabular text-3xl font-semibold text-foreground">{value}</span>}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
