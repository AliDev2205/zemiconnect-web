import type { Permission } from '@/lib/permissions';

export type Role = 'admin' | 'gestionnaire' | 'agent';

export type AccountStatus = 'actif' | 'desactive' | 'archive';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: Role;
  account_status: AccountStatus;
  // Vrai tant que l'utilisateur n'a pas remplacé son mot de passe provisoire.
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
  // Agents de contrôle : matricule et structure de rattachement (police
  // municipale, syndicat…). Absents pour les autres rôles.
  matricule?: string | null;
  structure?: string | null;
}

// Réponse de GET /auth/me : l'utilisateur et ses permissions effectives.
export interface Me {
  user: User;
  permissions: Permission[];
}
