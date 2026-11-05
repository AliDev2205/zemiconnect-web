'use client';

import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import Field, { describedBy, fieldBox, fieldBoxError, fieldBoxIdle, fieldHeights, FieldSize } from './Field';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'required'> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  inputSize?: FieldSize;
}

// Select natif : accessible, utilisable au clavier et sur mobile, compatible register().
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, required, helperText, error, options, placeholder, inputSize = 'md', className, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Field id={fieldId} label={label} required={required} helperText={helperText} error={error} className={className}>
        <div className={clsx(fieldBox, 'relative pr-0', fieldHeights[inputSize], error ? fieldBoxError : fieldBoxIdle)}>
          <select
            ref={ref}
            id={fieldId}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy(fieldId, error, helperText)}
            className="h-full w-full cursor-pointer appearance-none bg-transparent pr-9 outline-none"
            {...props}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted" aria-hidden />
        </div>
      </Field>
    );
  },
);
Select.displayName = 'Select';

export default Select;
