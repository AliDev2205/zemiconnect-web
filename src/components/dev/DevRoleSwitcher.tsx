'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { FlaskConical } from 'lucide-react';
import { useMe } from '@/hooks/queries/useAuth';
import { isMockMode } from '@/lib/api/mock';
import { setRoleHint } from '@/lib/auth/session';
import { getHomeRouteForRole, isRole, ROLE_LABELS, ROLES } from '@/lib/constants';
import { authKeys } from '@/lib/query/keys';

// Sélecteur de rôle fictif : développement + mode fictif uniquement.
// Change le rôle renvoyé par le faux /auth/me puis ouvre l'espace correspondant.
export default function DevRoleSwitcher({ onDark }: { onDark?: boolean }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data } = useMe();

  if (process.env.NODE_ENV !== 'development' || !isMockMode()) return null;

  return (
    <label
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-field border border-dashed px-2 py-1 text-xs font-semibold',
        onDark ? 'border-white/50 text-white' : 'border-warning text-warning',
      )}
      title="Mode fictif : changer de rôle"
    >
      <FlaskConical size={14} aria-hidden />
      <span className="sr-only">Rôle fictif</span>
      <select
        value={data?.user.role ?? 'admin'}
        onChange={async (event) => {
          const role = event.target.value;
          if (!isRole(role)) return;
          setRoleHint(role);
          await queryClient.invalidateQueries({ queryKey: authKeys.me });
          router.push(getHomeRouteForRole(role));
        }}
        className={clsx('cursor-pointer bg-transparent outline-none', onDark && '[&>option]:text-foreground')}
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </label>
  );
}
