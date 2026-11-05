import AppLayout from '@/components/layout/AppLayout';
import AppProviders from '@/components/providers/AppProviders';

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AppLayout space="gestion">{children}</AppLayout>
    </AppProviders>
  );
}
