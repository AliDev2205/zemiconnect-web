import AppLayout from '@/components/layout/AppLayout';

// Même coque que la gestion, libellé « Administration » sous le logo.
export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout space="administration">{children}</AppLayout>;
}
