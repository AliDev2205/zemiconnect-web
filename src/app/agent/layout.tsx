import AuthGuard from '@/components/auth/AuthGuard';
import AgentTopBar from '@/components/layout/AgentTopBar';
import AppProviders from '@/components/providers/AppProviders';

// Coque agent : mobile d'abord, utilisée dehors, en plein soleil, sur un
// téléphone d'entrée de gamme. Gros caractères (libellés de champs agrandis
// ici), contrastes forts, cibles tactiles d'au moins 48 px. Le bouton jaune
// « Scanner » est porté par chaque écran (AG1 : gros bouton, AG3 : fixé en bas).
export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AuthGuard space="agent">
        <div className="flex min-h-screen flex-col bg-background text-base">
          <AgentTopBar />
          <main className="mx-auto w-full max-w-md flex-1 px-4 pt-5 pb-8 [&_label]:text-sm [&_label]:text-foreground">{children}</main>
        </div>
      </AuthGuard>
    </AppProviders>
  );
}
