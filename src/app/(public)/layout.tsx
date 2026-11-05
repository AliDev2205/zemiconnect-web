import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';

// Pages publiques (passagers) : jamais de redirection vers /connexion.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted">
          <span>ZemiConnect · Parakou · prototype indépendant</span>
          <Link href="/mentions-legales" className="hover:text-primary hover:underline">
            Mentions légales
          </Link>
        </div>
      </footer>
    </div>
  );
}
