'use client';

import ErrorState from '@/components/ui/ErrorState';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <ErrorState message="Le chargement de la page a échoué." onRetry={reset} />
    </div>
  );
}
