import AuthGuard from '@/components/auth/AuthGuard';
import type { Space } from '@/lib/constants';
import AppSidebar from './AppSidebar';
import AppTopBar from './AppTopBar';

interface Props {
  space: Exclude<Space, 'agent'>;
  children: React.ReactNode;
}

// Coque commune gestion / administration : barre latérale + barre supérieure.
// Conçue pour un écran d'ordinateur (maquettes en 1440 px).
export default function AppLayout({ space, children }: Props) {
  return (
    <AuthGuard space={space}>
      <div className="flex h-screen min-w-[1024px] overflow-hidden bg-background">
        <AppSidebar space={space} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopBar />
          <main className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto w-full max-w-[1200px]">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
