import ToastContainer from '@/components/ui/Toast';
import QueryProvider from './QueryProvider';

// React Query + toasts, montés seulement par les layouts qui en ont besoin
// ((auth), agent, gestion, administration, dev). Les pages publiques (PU1 à
// PU3) ne les chargent pas : elles restent légères pour les passagers.
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <ToastContainer />
    </QueryProvider>
  );
}
