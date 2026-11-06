'use client';

import { useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import DevRoleSwitcher from '@/components/dev/DevRoleSwitcher';
import { useOverlay } from '@/components/ui/useOverlay';
import { useMe } from '@/hooks/queries/useAuth';
import { ROLE_LABELS, Space } from '@/lib/constants';
import { getInitials } from '@/lib/utils/format';
import AppSidebar from './AppSidebar';

export default function AppTopBar({ space }: { space: Exclude<Space, 'agent'> }) {
  const { data } = useMe();
  const [navOpen, setNavOpen] = useState(false);
  const panelRef = useOverlay(navOpen, () => setNavOpen(false));
  const user = data?.user;
  const fullName = user ? `${user.first_name} ${user.last_name}` : '';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 md:justify-end md:px-6">
      {/* Sous 768 px : navigation dans un panneau. */}
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        className="flex h-10 items-center gap-2 rounded-field px-2 text-sm font-semibold text-primary hover:bg-secondary md:hidden"
        aria-expanded={navOpen}
      >
        <MenuIcon size={20} aria-hidden />
        Menu
      </button>
      {navOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-[rgba(19,33,43,0.6)]" onClick={() => setNavOpen(false)} aria-hidden />
          <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Navigation" tabIndex={-1} className="relative h-full outline-none">
            <AppSidebar space={space} onNavigate={() => setNavOpen(false)} />
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="absolute top-4 right-3 flex h-9 w-9 items-center justify-center rounded-field text-white hover:bg-white/10"
              aria-label="Fermer la navigation"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <DevRoleSwitcher />
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold text-foreground">{fullName}</p>
              <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary" aria-hidden>
              {getInitials(fullName)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
