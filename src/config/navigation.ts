import type { LucideIcon } from 'lucide-react';
import {
  Bike,
  FileClock,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  UsersRound,
} from 'lucide-react';
import type { Space } from '@/lib/constants';
import { can, Permission } from '@/lib/permissions';
import type { Me } from '@/types/user';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  route: string;
  // Absent : visible par tout utilisateur de l'espace.
  permission?: Permission;
  // Actif seulement sur la route exacte (tableaux de bord).
  exact?: boolean;
}

// Menus par espace, déclarés comme données (convention HealthBook) puis
// filtrés par permission. Masquer un lien n'est qu'un confort : l'API répond 403.
export const NAVIGATION: Record<Space, NavItem[]> = {
  gestion: [
    { label: 'Tableau de bord', icon: LayoutDashboard, route: '/gestion', permission: 'dashboard.view', exact: true },
    { label: 'Conducteurs', icon: Users, route: '/gestion/conducteurs', permission: 'drivers.view' },
    { label: 'Motos', icon: Bike, route: '/gestion/motos', permission: 'motorcycles.view' },
    { label: 'Agents', icon: ShieldCheck, route: '/gestion/agents', permission: 'agents.view' },
    { label: 'Journaux', icon: FileClock, route: '/gestion/journaux', permission: 'logs.view' },
  ],
  administration: [
    { label: 'Tableau de bord', icon: LayoutDashboard, route: '/administration', permission: 'dashboard.view', exact: true },
    { label: 'Gestionnaires', icon: UsersRound, route: '/administration/gestionnaires', permission: 'managers.view' },
    { label: 'Conducteurs', icon: Users, route: '/administration/conducteurs', permission: 'drivers.view' },
    { label: 'Motos', icon: Bike, route: '/administration/motos', permission: 'motorcycles.view' },
    { label: 'Agents', icon: ShieldCheck, route: '/administration/agents', permission: 'agents.view' },
    { label: 'Journaux', icon: FileClock, route: '/administration/journaux', permission: 'logs.view' },
    { label: 'Paramètres', icon: Settings, route: '/administration/parametres', permission: 'settings.manage' },
  ],
  agent: [
    { label: 'Accueil', icon: Home, route: '/agent', exact: true },
    { label: 'Rechercher', icon: Search, route: '/agent/recherche', permission: 'agent.drivers.view' },
    { label: 'Mon profil', icon: UserCircle, route: '/agent/profil' },
  ],
};

// Liens du bas de la barre latérale (avant « Se déconnecter »).
export const PROFILE_ROUTE: Record<Space, string> = {
  agent: '/agent/profil',
  gestion: '/gestion/profil',
  administration: '/administration/profil',
};

export function getNavigation(space: Space, me: Me | null | undefined): NavItem[] {
  return NAVIGATION[space].filter((item) => !item.permission || can(me, item.permission));
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.route : pathname === item.route || pathname.startsWith(`${item.route}/`);
}
