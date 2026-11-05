import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <EmptyState
        title="Page introuvable"
        message="L'adresse demandée n'existe pas ou a été déplacée."
        action={
          <Link href="/" className={buttonClasses({ variant: 'outline' })}>
            Retour à l&apos;accueil
          </Link>
        }
      />
    </div>
  );
}
