'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, UserCircle, X } from 'lucide-react';
import DevRoleSwitcher from '@/components/dev/DevRoleSwitcher';
import { useLogout } from '@/hooks/queries/useAuth';
import Logo from './Logo';

// Barre supérieure de l'espace agent (mobile d'abord). Menu : Mon profil, Se déconnecter.
export default function AgentTopBar() {
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur et à Échap.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = 'flex min-h-12 w-full items-center gap-3 px-4 text-left text-base font-semibold text-foreground hover:bg-secondary';

  return (
    <header className="sticky top-0 z-30 bg-primary">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between gap-2 px-4">
        <Link href="/agent" aria-label="Accueil agent" className="flex min-h-12 items-center">
          <Logo onDark />
        </Link>
        <div className="flex items-center gap-1">
          <DevRoleSwitcher onDark />
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-12 min-w-12 items-center justify-center gap-1.5 rounded-field px-3 text-base font-semibold text-white hover:bg-white/10"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
              Menu
            </button>
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-card border border-border bg-surface py-1">
                <Link href="/agent/profil" role="menuitem" className={item} onClick={() => setOpen(false)}>
                  <UserCircle size={22} aria-hidden />
                  Mon profil
                </Link>
                <button type="button" role="menuitem" className={item} disabled={logout.isPending} onClick={() => logout.mutate()}>
                  <LogOut size={22} aria-hidden />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
