'use client';

import Link from 'next/link';
import { LogOut, UserCircle } from 'lucide-react';
import DevRoleSwitcher from '@/components/dev/DevRoleSwitcher';
import { useLogout } from '@/hooks/queries/useAuth';
import Logo from './Logo';

// Barre supérieure de l'espace agent (mobile d'abord).
export default function AgentTopBar() {
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 bg-primary">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-2 px-4">
        <Link href="/agent" aria-label="Accueil agent">
          <Logo onDark />
        </Link>
        <div className="flex items-center gap-1">
          <DevRoleSwitcher onDark />
          <Link
            href="/agent/profil"
            className="flex h-11 w-11 items-center justify-center rounded-field text-white hover:bg-white/10"
            aria-label="Mon profil"
          >
            <UserCircle size={22} />
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex h-11 w-11 items-center justify-center rounded-field text-white hover:bg-white/10"
            aria-label="Se déconnecter"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
