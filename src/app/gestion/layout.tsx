import AppLayout from '@/components/layout/AppLayout';

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout space="gestion">{children}</AppLayout>;
}
