import type { Permission } from '@/lib/permissions';
import type { Me, Role, User } from '@/types/user';

export const MOCK_DOMAIN = 'zemiconnect.exemple';

// Mot de passe commun à tous les comptes de démonstration (mode fictif).
export const MOCK_PASSWORD = 'demo-zc-2026';
// Adresse qui simule le blocage temporaire après trop d'essais (429).
export const MOCK_LOCKED_EMAIL = `bloque@${MOCK_DOMAIN}`;

export const mockUsers: User[] = [
  {
    id: 'usr-admin-1',
    first_name: 'Kofi',
    last_name: 'DOSSOU',
    email: `kofi.dossou@${MOCK_DOMAIN}`,
    phone: '+229 01 97 00 00 01',
    role: 'admin',
    account_status: 'actif',
    must_change_password: false,
    last_login_at: '2026-11-04T08:12:00Z',
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'usr-gest-1',
    first_name: 'Aïcha',
    last_name: 'TOKO',
    email: `aicha.toko@${MOCK_DOMAIN}`,
    phone: '+229 01 97 00 00 02',
    role: 'gestionnaire',
    account_status: 'actif',
    must_change_password: false,
    last_login_at: '2026-11-04T10:30:00Z',
    created_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'usr-gest-2',
    first_name: 'Sylvain',
    last_name: 'HOUNKPATIN',
    email: `sylvain.hounkpatin@${MOCK_DOMAIN}`,
    phone: null,
    role: 'gestionnaire',
    account_status: 'desactive',
    must_change_password: false,
    last_login_at: '2026-09-12T15:00:00Z',
    created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 'usr-agent-1',
    first_name: 'Bachirou',
    last_name: 'SANNI',
    email: `bachirou.sanni@${MOCK_DOMAIN}`,
    phone: '+229 01 97 00 00 03',
    role: 'agent',
    account_status: 'actif',
    must_change_password: false,
    last_login_at: '2026-11-05T07:45:00Z',
    created_at: '2026-03-01T09:00:00Z',
    matricule: 'AG-0142',
    structure: 'Police municipale de Parakou (fictive)',
  },
  {
    id: 'usr-agent-2',
    first_name: 'Florent',
    last_name: 'AGBO',
    email: `florent.agbo@${MOCK_DOMAIN}`,
    phone: '+229 01 97 00 00 04',
    role: 'agent',
    account_status: 'actif',
    must_change_password: true,
    last_login_at: null,
    created_at: '2026-10-20T09:00:00Z',
    matricule: 'AG-0157',
    structure: 'Police municipale de Parakou (fictive)',
  },
  {
    id: 'usr-agent-3',
    first_name: 'Chantal',
    last_name: 'SEIDOU',
    email: `chantal.seidou@${MOCK_DOMAIN}`,
    phone: '+229 01 97 00 00 05',
    role: 'agent',
    account_status: 'desactive',
    must_change_password: false,
    last_login_at: '2026-08-14T16:20:00Z',
    created_at: '2026-03-12T09:00:00Z',
    matricule: 'AG-0127',
    structure: 'Syndicat des conducteurs de taxi-moto (fictif)',
  },
  {
    id: 'usr-agent-4',
    first_name: 'Ousmane',
    last_name: 'ADAM',
    email: `ousmane.adam@${MOCK_DOMAIN}`,
    phone: null,
    role: 'agent',
    account_status: 'archive',
    must_change_password: false,
    last_login_at: '2026-05-02T10:05:00Z',
    created_at: '2026-03-15T09:00:00Z',
    matricule: 'AG-0118',
    structure: 'Police municipale de Parakou (fictive)',
  },
];

// Miroir supposé des permissions que l'API renverra par rôle.
// L'administrateur ne fait aucune opération métier : lecture seule, plus la
// gestion des gestionnaires et des paramètres.
export const MOCK_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'dashboard.view',
    'drivers.view',
    'motorcycles.view',
    'agents.view',
    'managers.view',
    'managers.manage',
    'logs.view',
    'settings.manage',
  ],
  gestionnaire: [
    'dashboard.view',
    'drivers.view',
    'drivers.manage',
    'motorcycles.view',
    'motorcycles.manage',
    'documents.manage',
    'qr.manage',
    'agents.view',
    'agents.manage',
    'logs.view',
  ],
  agent: ['agent.drivers.view'],
};

export function mockMeForRole(role: Role): Me {
  const user = mockUsers.find((candidate) => candidate.role === role) ?? mockUsers[0];
  return { user, permissions: MOCK_ROLE_PERMISSIONS[role] };
}
