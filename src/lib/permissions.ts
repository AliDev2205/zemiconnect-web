import type { Me } from '@/types/user';

// Permissions renvoyées par GET /auth/me. Le front s'en sert pour afficher ou
// masquer des éléments ; l'API reste seule juge (elle répond 403 sinon).
export const PERMISSIONS = [
  'drivers.view',
  'drivers.manage',
  'motorcycles.view',
  'motorcycles.manage',
  'documents.manage',
  'qr.manage',
  'agents.view',
  'agents.manage',
  'managers.view',
  'managers.manage',
  'logs.view',
  'settings.manage',
  'agent.drivers.view',
  'dashboard.view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function can(me: Me | null | undefined, permission: Permission): boolean {
  return me?.permissions.includes(permission) ?? false;
}
