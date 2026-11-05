import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';

// Pages publiques (passagers) : jamais de redirection vers /connexion.
// Chaque page gère sa largeur (le bandeau de statut de PU2 est pleine largeur).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-xs text-muted">
          <span>Prototype · ZemiConnect, Parakou</span>
          <Link href="/mentions-legales" prefetch={false} className="inline-flex min-h-11 items-center hover:text-primary hover:underline">
            Mentions légales
          </Link>
        </div>
      </footer>
    </div>
  );
}
