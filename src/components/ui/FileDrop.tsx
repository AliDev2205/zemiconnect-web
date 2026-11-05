'use client';

import React, { useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { FileText, UploadCloud, X } from 'lucide-react';
import Field from './Field';

interface FileDropProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  accept?: string;
  // Taille maximale indicative ; la limite réelle est vérifiée par l'API.
  maxSizeMb?: number;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

// Zone de dépôt contrôlée : à brancher via <Controller> de React Hook Form.
export default function FileDrop({
  label,
  required,
  helperText,
  error,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSizeMb = 5,
  value,
  onChange,
  disabled,
  className,
}: FileDropProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`Fichier trop volumineux (${maxSizeMb} Mo maximum).`);
      return;
    }
    setLocalError(null);
    onChange(file);
  }

  return (
    <Field
      id={id}
      label={label}
      required={required}
      helperText={helperText ?? `JPG, PNG ou PDF · ${maxSizeMb} Mo maximum`}
      error={error ?? localError ?? undefined}
      className={className}
    >
      {value ? (
        <div className="flex items-center gap-3 rounded-field border border-border bg-surface px-3 py-2.5">
          <FileText size={20} className="shrink-0 text-primary" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-sm">{value.name}</span>
          {!disabled && (
            <button type="button" onClick={() => onChange(null)} className="text-muted hover:text-danger" aria-label="Retirer le fichier">
              <X size={18} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!disabled) pick(event.dataTransfer.files[0]);
          }}
          className={clsx(
            'flex flex-col items-center gap-2 rounded-field border border-dashed px-4 py-6 text-center transition-colors',
            dragging ? 'border-primary bg-secondary' : error || localError ? 'border-danger' : 'border-border bg-surface',
            disabled && 'opacity-50',
          )}
        >
          <UploadCloud size={24} className="text-primary" aria-hidden />
          <p className="text-sm text-muted">
            Glissez un fichier ici ou{' '}
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-primary hover:underline"
            >
              parcourez
            </button>
          </p>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              pick(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </div>
      )}
    </Field>
  );
}
