'use client';

import React from 'react';
import clsx from 'clsx';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  // underline : onglets de fiche. pills : filtres rapides (DataTable).
  variant?: 'underline' | 'pills';
  ariaLabel?: string;
  className?: string;
}

export default function Tabs({ tabs, value, onChange, variant = 'underline', ariaLabel, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(variant === 'underline' ? 'flex gap-1 border-b border-border' : 'flex flex-wrap gap-1.5', className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={clsx(
              'inline-flex items-center gap-2 text-sm font-medium transition-colors',
              variant === 'underline'
                ? clsx('-mb-px border-b-2 px-3 py-2.5', active ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground')
                : clsx(
                    'h-9 rounded-field border px-3',
                    active ? 'border-primary bg-secondary text-primary' : 'border-border bg-surface text-muted hover:text-foreground',
                  ),
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && <span className={clsx('tabular text-xs', active ? 'text-primary' : 'text-muted')}>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
