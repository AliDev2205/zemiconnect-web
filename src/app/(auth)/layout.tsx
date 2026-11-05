import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import AppProviders from '@/components/providers/AppProviders';

// Pages d'authentification : colonne centrée, utilisable sur mobile comme sur ordinateur.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8 sm:py-14">
      <Link href="/" className="mb-6 inline-flex min-h-11 items-center" aria-label="Accueil ZemiConnect">
        <Logo />
      </Link>
      <main className="w-full max-w-md">
        <AppProviders>{children}</AppProviders>
      </main>
      <p className="mt-6 text-xs text-muted">Prototype · ZemiConnect, Parakou</p>
    </div>
  );
}
