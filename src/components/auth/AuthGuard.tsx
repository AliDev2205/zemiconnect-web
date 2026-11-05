'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ErrorState from '@/components/ui/ErrorState';
import { useMe } from '@/hooks/queries/useAuth';
import { toApiError } from '@/lib/api/errors';
import { setRoleHint } from '@/lib/auth/session';
import { getHomeRouteForRole, ROLE_SPACE, Space } from '@/lib/constants';

interface Props {
  space: Space;
  children: React.ReactNode;
}

// CONFORT UNIQUEMENT, PAS SÉCURITÉ. Ce garde évite d'afficher un espace qui
// n'est pas celui du rôle connecté (GET /auth/me) et renvoie vers le bon. Tout
// code client est contournable : la vraie vérification est faite par l'API à
// chaque appel (401 sans session, 403 hors du rôle).
export default function AuthGuard({ space, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending, isError, error, refetch } = useMe();

  const role = data?.user.role;
  const inRightSpace = role ? ROLE_SPACE[role] === space : false;
  const mustChangePassword = data?.user.must_change_password ?? false;

  useEffect(() => {
    // Garde l'indice de rôle de proxy.ts aligné sur /auth/me.
    if (role) setRoleHint(role);
  }, [role]);

  useEffect(() => {
    if (!role) return;
    if (!inRightSpace) router.replace(getHomeRouteForRole(role));
    else if (mustChangePassword) router.replace('/changer-mot-de-passe');
  }, [role, inRightSpace, mustChangePassword, router, pathname]);

  if (isError) {
    // 401 : l'intercepteur axios redirige déjà vers /connexion.
    if (toApiError(error).status === 401) return <FullScreenLoader />;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ErrorState message={toApiError(error).message} onRetry={() => refetch()} />
      </div>
    );
  }

  if (isPending || !inRightSpace || mustChangePassword) return <FullScreenLoader />;

  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status">
      <Loader2 size={28} className="animate-spin text-primary" aria-hidden />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
