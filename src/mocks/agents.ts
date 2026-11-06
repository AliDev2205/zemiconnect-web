import { MockApiError, matchesSearch, paginate } from '@/lib/api/mock';
import type { Paginated } from '@/types/api';
import type { AccountStatus, User } from '@/types/user';
import { pushLog } from './logs';
import { mockActor } from './session';
import { mockUsers } from './users';

// Champs saisis dans le Drawer « Nouvel agent » / « Modifier ».
export interface AgentInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  matricule: string;
  structure: string;
}

export interface AgentFiltersInput {
  page?: number;
  per_page?: number;
  search?: string;
  account_status?: AccountStatus;
}

const agents = () => mockUsers.filter((user) => user.role === 'agent');
const fullName = (user: User) => `${user.first_name} ${user.last_name}`;

function findAgent(id: string): User {
  const agent = agents().find((user) => user.id === id);
  if (!agent) throw new MockApiError(404, 'Agent introuvable.');
  return agent;
}

function audit(agent: User, action: Parameters<typeof pushLog>[0]['action'], extra: Partial<Parameters<typeof pushLog>[0]> = {}) {
  const actor = mockActor();
  pushLog({ actor_name: actor.name, actor_role: actor.role, action, resource_type: 'agent', resource_id: agent.id, resource_label: fullName(agent), ...extra });
}

// Unicité supposée côté API : email et matricule.
function checkUnique(input: AgentInput, excludeId?: string) {
  const others = mockUsers.filter((user) => user.id !== excludeId);
  const errors: Record<string, string[]> = {};
  if (others.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) errors.email = ['Cet email est déjà utilisé.'];
  if (others.some((user) => user.matricule && user.matricule.toLowerCase() === input.matricule.toLowerCase())) errors.matricule = ['Ce matricule est déjà utilisé.'];
  if (Object.keys(errors).length > 0) throw new MockApiError(422, 'Certaines informations sont déjà utilisées.', errors);
}

function editable(agent: User): User {
  if (agent.account_status === 'archive') throw new MockApiError(409, 'Ce compte est archivé : il ne peut plus être modifié.');
  return agent;
}

// Magasin fictif des comptes agents (GE7). Aucune suppression : on désactive ou on archive.
export const agentsStore = {
  list(filters: AgentFiltersInput): Paginated<User> {
    const rows = agents()
      .filter(
        (user) =>
          (!filters.account_status || user.account_status === filters.account_status) &&
          matchesSearch(filters.search, user.first_name, user.last_name, fullName(user), user.email, user.matricule, user.structure),
      )
      .sort((a, b) => a.last_name.localeCompare(b.last_name));
    return paginate(rows, filters.page, filters.per_page ?? 10);
  },

  get: findAgent,

  // Le compte est créé avec un mot de passe provisoire ; l'API envoie l'invitation par email.
  create(input: AgentInput): User {
    checkUnique(input);
    const agent: User = {
      id: `usr-${Date.now().toString(36)}`,
      ...input,
      email: input.email.trim().toLowerCase(),
      role: 'agent',
      account_status: 'actif',
      must_change_password: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
    };
    mockUsers.push(agent);
    audit(agent, 'agent.created');
    return agent;
  },

  update(id: string, input: AgentInput): User {
    const agent = editable(findAgent(id));
    checkUnique(input, id);
    const old: Record<string, unknown> = {};
    const next: Record<string, unknown> = {};
    (Object.keys(input) as (keyof AgentInput)[]).forEach((key) => {
      if ((agent[key] ?? null) !== (input[key] ?? null)) {
        old[key] = agent[key] ?? null;
        next[key] = input[key];
      }
    });
    Object.assign(agent, input);
    if (Object.keys(next).length > 0) audit(agent, 'agent.updated', { old_values: old, new_values: next });
    return agent;
  },

  // Désactivé : l'agent est déconnecté immédiatement (sessions révoquées par l'API).
  setStatus(id: string, status: 'actif' | 'desactive'): User {
    const agent = editable(findAgent(id));
    const old = agent.account_status;
    agent.account_status = status;
    audit(agent, status === 'desactive' ? 'agent.deactivated' : 'agent.reactivated', { old_values: { account_status: old }, new_values: { account_status: status } });
    return agent;
  },

  archive(id: string): User {
    const agent = editable(findAgent(id));
    const old = agent.account_status;
    agent.account_status = 'archive';
    audit(agent, 'agent.archived', { old_values: { account_status: old }, new_values: { account_status: 'archive' } });
    return agent;
  },

  sendResetLink(id: string): null {
    const agent = editable(findAgent(id));
    if (agent.account_status !== 'actif') throw new MockApiError(409, "Le compte est désactivé : réactivez-le avant d'envoyer un lien.");
    audit(agent, 'agent.reset_link_sent');
    return null;
  },
};
