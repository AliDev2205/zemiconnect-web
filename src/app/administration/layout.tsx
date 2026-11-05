import AppLayout from '@/components/layout/AppLayout';
import AppProviders from '@/components/providers/AppProviders';

// Même coque que la gestion, libellé « Administration » sous le logo.
export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AppLayout space="administration">{children}</AppLayout>
    </AppProviders>
  );
}
