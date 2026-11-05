'use client';

import { useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { toast, toastStore, ToastStatus } from '@/lib/toast/store';

const styles: Record<ToastStatus, { className: string; Icon: typeof Info; label: string }> = {
  success: { className: 'border-success text-success', Icon: CheckCircle2, label: 'Succès' },
  error: { className: 'border-danger text-danger', Icon: XCircle, label: 'Erreur' },
  warning: { className: 'border-warning text-warning', Icon: AlertTriangle, label: 'Attention' },
  info: { className: 'border-primary text-primary', Icon: Info, label: 'Information' },
};

// Monté une fois dans le layout racine ; alimenté par lib/toast/store.
export default function ToastContainer() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getServerSnapshot);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-60 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((item) => {
        const { className, Icon, label } = styles[item.status];
        return (
          <div
            key={item.id}
            role={item.status === 'error' ? 'alert' : 'status'}
            className={clsx('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-field border-l-4 border-y border-r bg-surface px-4 py-3', className)}
            style={{ borderTopColor: 'var(--color-border)', borderRightColor: 'var(--color-border)', borderBottomColor: 'var(--color-border)' }}
          >
            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
            <p className="flex-1 text-sm whitespace-pre-line text-foreground">
              <span className="sr-only">{label} : </span>
              {item.message}
            </p>
            <button type="button" onClick={() => toast.dismiss(item.id)} className="text-muted hover:text-foreground" aria-label="Fermer la notification">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
