import Link from 'next/link';
import Logo from '@/components/layout/Logo';

// Pages d'authentification : colonne centrée, utilisable sur mobile comme sur ordinateur.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-10">
      <Link href="/" className="mb-8" aria-label="Accueil ZemiConnect">
        <Logo />
      </Link>
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
