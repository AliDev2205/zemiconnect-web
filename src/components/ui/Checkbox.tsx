import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

// Case à cocher compatible React Hook Form (`{...register('champ')}`), cible
// tactile de 44 px de haut. Première utilisation : « Rester connecté » (AU1).
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, ...props }, ref) => (
  <label className={clsx('inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-foreground', className)}>
    <input
      ref={ref}
      type="checkbox"
      className="h-5 w-5 shrink-0 cursor-pointer rounded border-border accent-primary disabled:cursor-not-allowed"
      {...props}
    />
    <span>{label}</span>
  </label>
));
Checkbox.displayName = 'Checkbox';

export default Checkbox;
