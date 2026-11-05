'use client';

import React from 'react';
import clsx from 'clsx';
import Button from './Button';
import EmptyState from './EmptyState';
import { SearchInput } from './Input';
import Pagination, { PaginationProps } from './Pagination';
import Skeleton from './Skeleton';
import Tabs, { TabItem } from './Tabs';

// DataTable générique (convention HealthBook) : colonnes déclaratives,
// squelette de chargement, pagination serveur, en-tête avec recherche et filtres.

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface Head {
  title: string;
  subtitle?: string;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
}

export interface FilterTabs {
  value: string;
  tabs: TabItem[];
  filterAction: (value: string) => void;
}

export interface Search {
  value: string;
  placeholder?: string;
  searchAction: (value: string) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  // Clé stable de ligne (id) ; à défaut, l'index.
  getRowKey?: (row: T, index: number) => string;
  pagination?: PaginationProps;
  emptyTitle?: string;
  emptyMessage?: string;
  compact?: boolean;
  isLoading?: boolean;
  skeletonRows?: number;
  isHead?: Head;
  isFilterTabs?: FilterTabs;
  isSearch?: Search;
  // Filtres supplémentaires (Select, DateField…) placés dans l'en-tête.
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

const alignClass = (align: Column<unknown>['align']) =>
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

function skeletonWidth(rowIdx: number, colIdx: number): number {
  return 55 + ((rowIdx * 7 + colIdx * 13) % 35);
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  pagination,
  emptyTitle = 'Aucun résultat',
  emptyMessage = 'Aucun élément ne correspond à votre recherche.',
  compact = false,
  isLoading = false,
  skeletonRows = 5,
  isHead,
  isFilterTabs,
  isSearch,
  toolbar,
  onRowClick,
}: DataTableProps<T>) {
  const cell = compact ? 'px-4 py-2.5' : 'px-5 py-3.5';
  const hasToolbar = isHead || isFilterTabs || isSearch || toolbar;

  return (
    <div className="w-full overflow-hidden rounded-card border border-border bg-surface">
      {hasToolbar && (
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
          {isHead && (
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold">{isHead.title}</h2>
              {isHead.subtitle && <span className="text-sm text-muted">{isHead.subtitle}</span>}
            </div>
          )}
          <div className="flex flex-wrap items-end gap-2">
            {isSearch && <SearchInput value={isSearch.value} onChange={isSearch.searchAction} placeholder={isSearch.placeholder} className="w-64" />}
            {isFilterTabs && <Tabs variant="pills" value={isFilterTabs.value} tabs={isFilterTabs.tabs} onChange={isFilterTabs.filterAction} />}
            {toolbar}
            {isHead?.actions?.map((action) => (
              <Button key={action.label} size="sm" variant="outline" leftIcon={action.icon} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background text-xs font-semibold tracking-wide whitespace-nowrap text-muted uppercase">
              {columns.map((col) => (
                <th key={col.key} scope="col" className={clsx(cell, 'font-semibold', alignClass(col.align), col.className)}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {columns.map((col, colIdx) => (
                    <td key={col.key} className={cell}>
                      <div style={{ width: `${skeletonWidth(rowIdx, colIdx)}%` }}>
                        <Skeleton className="h-3.5" />
                      </div>
                      {rowIdx === 0 && colIdx === 0 && <span className="sr-only">Chargement…</span>}
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} message={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={getRowKey ? getRowKey(row, rowIdx) : rowIdx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={clsx('transition-colors hover:bg-secondary', onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={clsx(cell, alignClass(col.align), col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !isLoading && pagination.totalItems > 0 && <Pagination {...pagination} />}
    </div>
  );
}
