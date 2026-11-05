'use client';

import React from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Paginated } from '@/types/api';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Convertit la pagination Laravel en props de Pagination.
export function toPaginationProps<T>(page: Paginated<T> | undefined, onPageChange: (page: number) => void): PaginationProps | undefined {
  if (!page) return undefined;
  return {
    currentPage: page.current_page,
    totalPages: page.last_page,
    totalItems: page.total,
    itemsPerPage: page.per_page,
    onPageChange,
  };
}

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );
  const navButton = 'flex h-8 w-8 items-center justify-center rounded-field text-muted hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted">
      <span className="tabular">
        {from}–{to} sur {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className={navButton} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Page précédente">
          <ChevronLeft size={16} />
        </button>
        {pages.map((page, index) => (
          <React.Fragment key={page}>
            {index > 0 && pages[index - 1] !== page - 1 && <span className="px-1">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={clsx(
                'tabular h-8 min-w-8 rounded-field px-2 text-sm font-medium',
                page === currentPage ? 'bg-primary text-white' : 'text-foreground hover:bg-secondary',
              )}
            >
              {page}
            </button>
          </React.Fragment>
        ))}
        <button
          type="button"
          className={navButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
