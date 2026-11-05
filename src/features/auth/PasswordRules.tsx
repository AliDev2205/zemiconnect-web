import clsx from 'clsx';
import { CheckCircle2, Circle } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/validation/password';

// Règles affichées sous le champ, cochées au fur et à mesure de la saisie.
// Même source que le schéma Zod (lib/validation/password.ts).
export default function PasswordRules({ value, id }: { value: string; id?: string }) {
  return (
    <ul id={id} className="flex flex-col gap-1.5 rounded-field bg-background px-3 py-2.5 text-sm" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li key={rule.id} className={clsx('flex items-center gap-2', ok ? 'text-success' : 'text-muted')}>
            {ok ? <CheckCircle2 size={16} aria-hidden /> : <Circle size={16} aria-hidden />}
            <span>{rule.label}</span>
            <span className="sr-only">{ok ? ' : respecté' : ' : pas encore respecté'}</span>
          </li>
        );
      })}
    </ul>
  );
}
