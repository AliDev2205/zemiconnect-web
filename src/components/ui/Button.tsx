// Pas de 'use client' : aucun hook ici, et buttonClasses() doit rester
// appelable depuis un composant serveur (liens stylés en bouton).
import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  /** Bouton carré, icône seule : fournir un aria-label. */
  iconOnly?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover border border-transparent',
  secondary: 'bg-secondary text-primary hover:bg-[#d6e4ea] border border-transparent',
  outline: 'bg-surface text-muted hover:text-foreground hover:bg-background border border-border',
  ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-secondary border border-transparent',
  danger: 'bg-danger text-white hover:bg-[#9a1d14] border border-transparent',
  // Réservé au bouton « Scanner un QR ».
  accent: 'bg-accent text-foreground hover:bg-accent-hover border border-transparent',
  link: 'bg-transparent text-primary hover:underline border border-transparent px-0!',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-13 px-6 text-base gap-2',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  lg: 'h-13 w-13',
};

// Exporté pour styler un <Link> comme un bouton sans dupliquer les classes.
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  iconOnly,
  className,
}: Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'iconOnly' | 'className'> = {}): string {
  return clsx(
    'inline-flex shrink-0 items-center justify-center rounded-field font-semibold transition-colors select-none cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    iconOnly ? iconSizes[size] : sizes[size],
    fullWidth && 'w-full',
    className,
  );
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading,
  fullWidth,
  iconOnly,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, iconOnly, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : leftIcon}
      {!(iconOnly && isLoading) && children}
      {rightIcon && !isLoading && rightIcon}
    </button>
  );
}
