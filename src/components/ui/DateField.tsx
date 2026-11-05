'use client';

import React, { forwardRef, useId } from 'react';
import clsx from 'clsx';
import Field, { describedBy, fieldBox, fieldBoxError, fieldBoxIdle, fieldHeights, FieldSize } from './Field';

interface DateFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'required'> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  inputSize?: FieldSize;
}

// Date au format ISO (AAAA-MM-JJ), celui attendu par Laravel. Un champ vide
// signifie « pas de date » : ne jamais le remplacer par une valeur par défaut.
const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  ({ label, required, helperText, error, inputSize = 'md', className, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Field id={fieldId} label={label} required={required} helperText={helperText} error={error} className={className}>
        <div className={clsx(fieldBox, fieldHeights[inputSize], error ? fieldBoxError : fieldBoxIdle)}>
          <input
            ref={ref}
            id={fieldId}
            type="date"
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy(fieldId, error, helperText)}
            className="tabular h-full w-full bg-transparent outline-none"
            {...props}
          />
        </div>
      </Field>
    );
  },
);
DateField.displayName = 'DateField';

export default DateField;
