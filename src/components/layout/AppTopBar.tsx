'use client';

import DevRoleSwitcher from '@/components/dev/DevRoleSwitcher';
import { useMe } from '@/hooks/queries/useAuth';
import { ROLE_LABELS } from '@/lib/constants';
import { getInitials } from '@/lib/utils/format';

export default function AppTopBar() {
  const { data } = useMe();
  const user = data?.user;
  const fullName = user ? `${user.first_name} ${user.last_name}` : '';

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-border bg-surface px-6">
      <DevRoleSwitcher />
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-foreground">{fullName}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary" aria-hidden>
            {getInitials(fullName)}
          </span>
        </div>
      )}
    </header>
  );
}
