import Link from 'next/link';
import { LogIn } from 'lucide-react';
import Logo from './Logo';

export default function PublicHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" aria-label="Accueil ZemiConnect">
          <Logo />
        </Link>
        <Link href="/connexion" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <LogIn size={16} aria-hidden />
          Espace pro
        </Link>
      </div>
    </header>
  );
}
