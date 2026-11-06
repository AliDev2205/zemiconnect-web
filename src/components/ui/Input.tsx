'use client';

import React, { forwardRef, useId, useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, Search } from 'lucide-react';
import Field, { describedBy, fieldBox, fieldBoxError, fieldBoxIdle, fieldHeights, FieldSize } from './Field';

// Champs compatibles React Hook Form : `{...register('champ')}` suffit
// (forwardRef + props natives), l'erreur Zod passe par `error`.

interface BaseFieldProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  inputSize?: FieldSize;
}

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'required'>, BaseFieldProps {
  icon?: React.ReactNode;
}

const inputClass = 'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted/70 disabled:cursor-not-allowed';

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, required, helperText, error, icon, inputSize = 'md', className, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Field id={fieldId} label={label} required={required} helperText={helperText} error={error} className={className}>
        <div className={clsx(fieldBox, fieldHeights[inputSize], error ? fieldBoxError : fieldBoxIdle, props.disabled && 'bg-background')}>
          {icon && <span className="mr-2 shrink-0 text-muted">{icon}</span>}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy(fieldId, error, helperText)}
            className={inputClass}
            {...props}
          />
        </div>
      </Field>
    );
  },
);
TextInput.displayName = 'TextInput';

export const PasswordInput = forwardRef<HTMLInputElement, Omit<TextInputProps, 'type' | 'icon'>>(
  ({ label, required, helperText, error, inputSize = 'md', className, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const [visible, setVisible] = useState(false);
    return (
      <Field id={fieldId} label={label} required={required} helperText={helperText} error={error} className={className}>
        <div className={clsx(fieldBox, fieldHeights[inputSize], error ? fieldBoxError : fieldBoxIdle)}>
          <input
            ref={ref}
            id={fieldId}
            type={visible ? 'text' : 'password'}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy(fieldId, error, helperText)}
            className={inputClass}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            // Cible tactile sur toute la hauteur du champ (44 à 48 px), pas seulement l'icône.
            className="-my-px -mr-3 flex aspect-square h-[calc(100%+2px)] shrink-0 items-center justify-center text-muted hover:text-foreground"
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'>, Omit<BaseFieldProps, 'inputSize'> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, required, helperText, error, className, id, rows = 3, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Field id={fieldId} label={label} required={required} helperText={helperText} error={error} className={className}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy(fieldId, error, helperText)}
          className={clsx(fieldBox, 'py-2 outline-none placeholder:text-muted/70', error ? fieldBoxError : fieldBoxIdle)}
          {...props}
        />
      </Field>
    );
  },
);
TextArea.displayName = 'TextArea';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputSize?: FieldSize;
}

// Champ de recherche contrôlé (barres de filtres, DataTable).
export function SearchInput({ value, onChange, placeholder = 'Rechercher…', label, className, inputSize = 'sm' }: SearchInputProps) {
  return (
    <TextInput
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={label ? undefined : placeholder}
      label={label}
      icon={<Search size={16} />}
      inputSize={inputSize}
      className={className}
    />
  );
}
