import clsx from 'clsx';
import { Check } from 'lucide-react';

export interface StepItem {
  label: string;
  // Étape remplie (coche), indépendamment de l'étape affichée.
  done?: boolean;
}

interface StepperProps {
  steps: StepItem[];
  current: number;
  // Revenir à une étape déjà visitée, sans perdre la saisie.
  onSelect?: (index: number) => void;
  // Étapes accessibles (au-delà : boutons inactifs).
  maxReachable?: number;
}

// Étapes d'un assistant (GE3).
export default function Stepper({ steps, current, onSelect, maxReachable = current }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 rounded-card border border-border bg-surface px-4 py-3">
      {steps.map((step, index) => {
        const active = index === current;
        const reachable = index <= maxReachable;
        return (
          <li key={step.label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!onSelect || !reachable}
              onClick={() => onSelect?.(index)}
              aria-current={active ? 'step' : undefined}
              className={clsx('flex items-center gap-2 rounded-field px-1 py-1 text-left text-sm font-medium', reachable && onSelect && 'cursor-pointer hover:bg-secondary', !reachable && 'cursor-not-allowed')}
            >
              <span
                className={clsx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  active ? 'border-primary bg-primary text-white' : step.done ? 'border-success bg-success text-white' : 'border-border bg-surface text-muted',
                )}
                aria-hidden
              >
                {step.done && !active ? <Check size={14} /> : index + 1}
              </span>
              <span className={clsx(active ? 'text-primary' : 'text-foreground')}>
                {step.label}
                <span className="sr-only">{step.done ? ' (remplie)' : ''}</span>
              </span>
            </button>
            {index < steps.length - 1 && <span className="hidden h-px flex-1 bg-border lg:block" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
