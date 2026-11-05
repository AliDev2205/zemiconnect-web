import AuthGuard from '@/components/auth/AuthGuard';
import AgentScanButton from '@/components/layout/AgentScanButton';
import AgentTopBar from '@/components/layout/AgentTopBar';
import AppProviders from '@/components/providers/AppProviders';

// Coque agent : mobile d'abord, barre supérieure, bouton « Scanner un QR » fixé en bas.
export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AuthGuard space="agent">
        <div className="flex min-h-screen flex-col bg-background">
          <AgentTopBar />
          <main className="mx-auto w-full max-w-md flex-1 px-4 pt-5 pb-32">{children}</main>
          <AgentScanButton />
        </div>
      </AuthGuard>
    </AppProviders>
  );
}
