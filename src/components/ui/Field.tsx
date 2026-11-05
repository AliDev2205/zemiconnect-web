import React from 'react';
import clsx from 'clsx';

// Habillage commun des champs : libellé au-dessus, aide ou erreur en dessous.
// Les champs (Input, Select, DateField, FileDrop) l'utilisent tous.

export const fieldBox =
  'flex w-full items-center rounded-field border bg-surface px-3 text-[15px] text-foreground transition-colors ' +
  'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary';
export const fieldBoxIdle = 'border-border';
export const fieldBoxError = 'border-danger focus-within:border-danger focus-within:ring-danger';
export const fieldHeights = { sm: 'h-9', md: 'h-11', lg: 'h-12' } as const;
export type FieldSize = keyof typeof fieldHeights;

interface FieldProps {
  id: string;
  label?: string;
  // Astérisque visuel ; la validation reste dans le schéma Zod.
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Field({ id, label, required, helperText, error, className, children }: FieldProps) {
  return (
    <div className={clsx('flex w-full flex-col', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 text-xs font-semibold text-muted">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : (
        helperText && (
          <p id={`${id}-help`} className="mt-1 text-xs text-muted">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, helperText?: string): string | undefined {
  if (error) return `${id}-error`;
  if (helperText) return `${id}-help`;
  return undefined;
}
