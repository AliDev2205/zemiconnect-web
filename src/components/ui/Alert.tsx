import React from 'react';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  tone?: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const tones: Record<AlertTone, { box: string; Icon: typeof Info }> = {
  info: { box: 'bg-secondary border-secondary text-foreground [&_svg]:text-primary', Icon: Info },
  success: { box: 'bg-success-soft border-success-soft text-success', Icon: CheckCircle2 },
  warning: { box: 'bg-warning-soft border-warning-soft text-warning', Icon: AlertTriangle },
  danger: { box: 'bg-danger-soft border-danger-soft text-danger', Icon: XCircle },
};

// Message en ligne dans une page ou un formulaire (erreur de connexion,
// confirmation, consigne). Toujours une icône et un texte, jamais la couleur seule.
// Les erreurs et confirmations sont annoncées aux lecteurs d'écran.
export default function Alert({ tone = 'info', title, children, icon, className }: AlertProps) {
  const { box, Icon } = tones[tone];
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={clsx('flex gap-3 rounded-field border px-4 py-3 text-sm', box, className)}
    >
      <span className="mt-0.5 flex shrink-0" aria-hidden>
        {icon ?? <Icon size={18} />}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={clsx(title && 'text-foreground/80')}>{children}</div>}
      </div>
    </div>
  );
}
