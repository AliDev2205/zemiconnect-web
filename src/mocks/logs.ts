import type { AppSettings, DashboardStats } from '@/types/dashboard';
import type { LogEntry } from '@/types/log';
import { MOCK_DOMAIN } from './users';

export const mockLogs: LogEntry[] = [
  {
    id: 'log-1',
    kind: 'audit',
    action: 'driver.suspended',
    actor_name: 'Aïcha TOKO',
    actor_role: 'gestionnaire',
    resource_type: 'driver',
    resource_label: 'Rachidi BIO (ZC-771204)',
    old_values: { status: 'actif' },
    new_values: { status: 'suspendu' },
    reason: 'Droit de taxi expiré depuis plus de deux mois.',
    ip_address: '102.64.10.21',
    created_at: '2026-09-15T09:00:00Z',
  },
  {
    id: 'log-2',
    kind: 'consultation',
    action: 'driver.viewed_by_qr',
    actor_name: 'Bachirou SANNI',
    actor_role: 'agent',
    resource_type: 'driver',
    resource_label: 'Moussa ALASSANE (ZC-482917)',
    old_values: null,
    new_values: null,
    reason: null,
    ip_address: '102.64.10.40',
    created_at: '2026-11-05T07:52:00Z',
  },
  {
    id: 'log-3',
    kind: 'connexion',
    action: 'auth.login',
    actor_name: 'Kofi DOSSOU',
    actor_role: 'admin',
    resource_type: null,
    resource_label: null,
    old_values: null,
    new_values: null,
    reason: null,
    ip_address: '102.64.10.2',
    created_at: '2026-11-04T08:12:00Z',
  },
  {
    id: 'log-4',
    kind: 'audit',
    action: 'qr.revoked',
    actor_name: 'Aïcha TOKO',
    actor_role: 'gestionnaire',
    resource_type: 'qr_code',
    resource_label: 'Moussa ALASSANE (ZC-482917)',
    old_values: { status: 'actif' },
    new_values: { status: 'revoque' },
    reason: 'Badge réimprimé après erreur de photo.',
    ip_address: '102.64.10.21',
    created_at: '2026-03-02T08:59:00Z',
  },
];

export const mockDashboard: DashboardStats = {
  drivers_total: 5,
  drivers_by_status: { en_attente: 1, actif: 2, suspendu: 1, archive: 1 },
  drivers_by_compliance: { conforme: 1, expire_bientot: 1, non_conforme: 3 },
  motorcycles_total: 4,
  agents_total: 2,
  controls_last_7_days: 18,
};

export const mockSettings: AppSettings = {
  public_domain: MOCK_DOMAIN,
  expiry_warning_days: 30,
};
