// Store de toasts minimal (convention HealthBook) : module + abonnés, lu par
// useSyncExternalStore dans components/ui/Toast.tsx. Utilisable hors React
// (MutationCache, intercepteurs) sans état global supplémentaire.

export type ToastStatus = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  status: ToastStatus;
  message: string;
}

type Listener = () => void;

const DEFAULT_DURATION = 4000;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((listener) => listener());
}

function dismiss(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

function push(status: ToastStatus, message: string, duration = DEFAULT_DURATION): string {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, status, message }];
  emit();
  timers.set(
    id,
    setTimeout(() => dismiss(id), duration),
  );
  return id;
}

const EMPTY: ToastItem[] = [];

export const toastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): ToastItem[] {
    return toasts;
  },
  getServerSnapshot(): ToastItem[] {
    return EMPTY;
  },
};

export const toast = {
  success: (message: string, duration?: number) => push('success', message, duration),
  error: (message: string, duration?: number) => push('error', message, duration),
  warning: (message: string, duration?: number) => push('warning', message, duration),
  info: (message: string, duration?: number) => push('info', message, duration),
  dismiss,
};
