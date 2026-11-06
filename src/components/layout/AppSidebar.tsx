'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LogOut, UserCircle } from 'lucide-react';
import { getNavigation, isNavItemActive, PROFILE_ROUTE } from '@/config/navigation';
import { useLogout, useMe } from '@/hooks/queries/useAuth';
import type { Space } from '@/lib/constants';
import Logo from './Logo';

const linkBase =
  'flex h-10 items-center gap-3 rounded-field border-l-[3px] px-3 text-sm font-medium transition-colors';
const linkIdle = 'border-transparent text-white/75 hover:bg-white/10 hover:text-white';
const linkActive = 'border-white bg-white/15 text-white';

// Barre latérale 240 px bleu pétrole des espaces gestion et administration.
export default function AppSidebar({ space, className, onNavigate }: { space: Exclude<Space, 'agent'>; className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: me } = useMe();
  const logout = useLogout();
  const items = getNavigation(space, me);
  const profileRoute = PROFILE_ROUTE[space];

  return (
    <aside className={clsx('h-full w-sidebar shrink-0 flex-col bg-primary', className ?? 'flex')} onClick={(event) => (event.target as HTMLElement).closest('a') && onNavigate?.()}>
      <div className="px-5 pt-6 pb-6">
        <Link href={items[0]?.route ?? '/'} aria-label="Tableau de bord">
          <Logo onDark />
        </Link>
        {space === 'administration' && (
          <p className="mt-2 pl-10.5 text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">Administration</p>
        )}
      </div>

      <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.route}>
                <Link href={item.route} aria-current={active ? 'page' : undefined} className={clsx(linkBase, active ? linkActive : linkIdle)}>
                  <Icon size={18} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-1 border-t border-white/15 px-3 py-4">
        <Link
          href={profileRoute}
          aria-current={pathname === profileRoute ? 'page' : undefined}
          className={clsx(linkBase, pathname === profileRoute ? linkActive : linkIdle)}
        >
          <UserCircle size={18} aria-hidden />
          Mon profil
        </Link>
        <button type="button" onClick={() => logout.mutate()} disabled={logout.isPending} className={clsx(linkBase, linkIdle, 'w-full text-left')}>
          <LogOut size={18} aria-hidden />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
