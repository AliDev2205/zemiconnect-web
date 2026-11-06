import AuthGuard from '@/components/auth/AuthGuard';
import type { Space } from '@/lib/constants';
import AppSidebar from './AppSidebar';
import AppTopBar from './AppTopBar';

interface Props {
  space: Exclude<Space, 'agent'>;
  children: React.ReactNode;
}

// Coque commune gestion / administration : barre latérale + barre supérieure.
// Conçue pour l'ordinateur (maquettes en 1440 px) ; sous 768 px, la barre
// latérale s'ouvre depuis le bouton « Menu » de la barre supérieure.
export default function AppLayout({ space, children }: Props) {
  return (
    <AuthGuard space={space}>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar space={space} className="hidden md:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopBar space={space} />
          <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">
            <div className="mx-auto w-full max-w-[1200px]">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
