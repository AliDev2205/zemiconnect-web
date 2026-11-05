import Link from 'next/link';
import { LogIn } from 'lucide-react';
import Logo from './Logo';

export default function PublicHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-xl items-center justify-between gap-3 px-4">
        <Link href="/" prefetch={false} aria-label="Accueil ZemiConnect">
          <Logo />
        </Link>
        <Link
          href="/connexion"
          prefetch={false}
          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary hover:underline"
        >
          {/* Icône masquée sous 400 px : le libellé tient sur une ligne à 360 px. */}
          <LogIn size={16} aria-hidden className="hidden min-[400px]:block" />
          Espace professionnel
        </Link>
      </div>
    </header>
  );
}
