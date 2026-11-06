import { MockApiError, matchesSearch, paginate } from '@/lib/api/mock';
import { getRoleHint } from '@/lib/auth/session';
import type { Paginated } from '@/types/api';
import type { User } from '@/types/user';
import { pushLog } from './logs';
import { mockActor, readMockSession } from './session';
import { mockUsers } from './users';

export interface ManagerInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

export interface ManagerFiltersInput {
  page?: number;
  per_page?: number;
  search?: string;
}

// Seuls des GESTIONNAIRES sont gérés ici : l'administrateur connecté n'apparaît
// jamais dans la liste et ne peut donc pas se désactiver lui-même.
const managers = () => mockUsers.filter((user) => user.role === 'gestionnaire');
const fullName = (user: User) => `${user.first_name} ${user.last_name}`;

// Permission managers.manage : réservée à l'administrateur (403 sinon).
function assertAdmin() {
  if (getRoleHint() !== 'admin') throw new MockApiError(403, "Action réservée à l'administrateur.");
}

function findManager(id: string): User {
  const manager = managers().find((user) => user.id === id);
  if (!manager) throw new MockApiError(404, 'Gestionnaire introuvable.');
  return manager;
}

function editable(manager: User): User {
  if (manager.id === readMockSession()?.userId) throw new MockApiError(409, 'Vous ne pouvez pas modifier votre propre compte ici.');
  if (manager.account_status === 'archive') throw new MockApiError(409, 'Ce compte est archivé : il ne peut plus être modifié.');
  return manager;
}

function audit(manager: User, action: Parameters<typeof pushLog>[0]['action'], extra: Partial<Parameters<typeof pushLog>[0]> = {}) {
  const actor = mockActor();
  pushLog({ actor_name: actor.name, actor_role: actor.role, action, resource_type: 'manager', resource_id: manager.id, resource_label: fullName(manager), ...extra });
}

function checkEmail(email: string, excludeId?: string) {
  if (mockUsers.some((user) => user.id !== excludeId && user.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new MockApiError(422, 'Cet email est déjà utilisé.', { email: ['Cet email est déjà utilisé.'] });
  }
}

// Magasin fictif des comptes gestionnaires (AD2). Aucune suppression.
export const managersStore = {
  list(filters: ManagerFiltersInput): Paginated<User> {
    const rows = managers()
      .filter((user) => matchesSearch(filters.search, user.first_name, user.last_name, fullName(user), user.email))
      .sort((a, b) => a.last_name.localeCompare(b.last_name));
    return paginate(rows, filters.page, filters.per_page ?? 10);
  },

  get: findManager,

  // Compte créé avec un mot de passe provisoire, envoyé par email d'invitation.
  create(input: ManagerInput): User {
    assertAdmin();
    checkEmail(input.email);
    const manager: User = {
      id: `usr-${Date.now().toString(36)}`,
      ...input,
      email: input.email.trim().toLowerCase(),
      role: 'gestionnaire',
      account_status: 'actif',
      must_change_password: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
    };
    mockUsers.push(manager);
    audit(manager, 'manager.created');
    return manager;
  },

  update(id: string, input: ManagerInput): User {
    assertAdmin();
    const manager = editable(findManager(id));
    checkEmail(input.email, id);
    const old: Record<string, unknown> = {};
    const next: Record<string, unknown> = {};
    (Object.keys(input) as (keyof ManagerInput)[]).forEach((key) => {
      if ((manager[key] ?? null) !== (input[key] ?? null)) {
        old[key] = manager[key] ?? null;
        next[key] = input[key];
      }
    });
    Object.assign(manager, input);
    if (Object.keys(next).length > 0) audit(manager, 'manager.updated', { old_values: old, new_values: next });
    return manager;
  },

  // Désactivation (motif obligatoire) : le gestionnaire est déconnecté immédiatement.
  setStatus(id: string, status: 'actif' | 'desactive', reason: string | null): User {
    assertAdmin();
    const manager = editable(findManager(id));
    if (status === 'desactive' && !reason?.trim()) throw new MockApiError(422, 'Le motif est obligatoire.', { reason: ['Le motif est obligatoire.'] });
    const old = manager.account_status;
    manager.account_status = status;
    audit(manager, status === 'desactive' ? 'manager.deactivated' : 'manager.reactivated', { old_values: { account_status: old }, new_values: { account_status: status }, reason });
    return manager;
  },

  archive(id: string, reason: string): User {
    assertAdmin();
    const manager = editable(findManager(id));
    if (!reason.trim()) throw new MockApiError(422, 'Le motif est obligatoire.', { reason: ['Le motif est obligatoire.'] });
    const old = manager.account_status;
    manager.account_status = 'archive';
    audit(manager, 'manager.archived', { old_values: { account_status: old }, new_values: { account_status: 'archive' }, reason });
    return manager;
  },

  sendResetLink(id: string): null {
    assertAdmin();
    const manager = editable(findManager(id));
    if (manager.account_status !== 'actif') throw new MockApiError(409, "Le compte est désactivé : réactivez-le avant d'envoyer un lien.");
    audit(manager, 'manager.reset_link_sent');
    return null;
  },
};
