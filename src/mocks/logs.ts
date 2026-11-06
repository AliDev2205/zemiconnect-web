import type { AuditAction, LogEntry, LogKind } from '@/types/log';
import { atDaysAgo } from './compliance';
import { mockDrivers } from './drivers';

let sequence = 0;

export function makeLog(entry: Partial<LogEntry> & { action: AuditAction; created_at: string }): LogEntry {
  sequence += 1;
  const kind: LogKind = entry.action.startsWith('consultation.') ? 'consultation' : entry.action === 'auth.login' ? 'connexion' : 'audit';
  return {
    id: `log-${sequence}`,
    kind,
    actor_name: 'Aïcha TOKO',
    actor_role: 'gestionnaire',
    resource_type: 'driver',
    resource_id: null,
    resource_label: null,
    driver_id: null,
    detail: null,
    old_values: null,
    new_values: null,
    reason: null,
    ip_address: '102.64.10.21',
    ...entry,
  };
}

function seedLogs(): LogEntry[] {
  const logs: LogEntry[] = [];
  for (const driver of mockDrivers) {
    const label = `${driver.first_name} ${driver.last_name}`;
    const base = { resource_id: driver.id, resource_label: label, driver_id: driver.id };
    logs.push(makeLog({ ...base, action: 'driver.created', created_at: driver.created_at }));
    if (driver.validated_at) {
      logs.push(makeLog({ ...base, action: 'driver.validated', created_at: driver.validated_at, new_values: { zc_number: driver.zc_number } }));
      logs.push(makeLog({ ...base, action: 'qr.generated', resource_type: 'qr_code', created_at: driver.validated_at }));
    }
    if (driver.motorcycle) {
      logs.push(makeLog({ ...base, action: 'assignment.changed', detail: driver.motorcycle.plate_number, created_at: driver.assignment_started_at ?? driver.created_at }));
    }
  }
  logs.push(
    makeLog({
      action: 'driver.suspended',
      resource_id: 'drv-3',
      resource_label: 'Rachidi BIO',
      driver_id: 'drv-3',
      old_values: { status: 'actif' },
      new_values: { status: 'suspendu' },
      reason: 'Contrôle : conduite sans casque à deux reprises.',
      created_at: atDaysAgo(40, 14),
    }),
    makeLog({
      action: 'driver.updated',
      resource_id: 'drv-1',
      resource_label: 'Moussa ALASSANE',
      driver_id: 'drv-1',
      old_values: { phone: '+229 01 96 00 00 00' },
      new_values: { phone: '+229 01 96 12 34 56' },
      created_at: atDaysAgo(20, 11),
    }),
    makeLog({
      action: 'document.renewed',
      resource_type: 'document',
      resource_id: 'drv-1',
      resource_label: 'Moussa ALASSANE',
      driver_id: 'drv-1',
      detail: 'Droit de taxi',
      created_at: atDaysAgo(220, 10),
    }),
    makeLog({
      action: 'qr.revoked',
      resource_type: 'qr_code',
      resource_id: 'drv-1',
      resource_label: 'Moussa ALASSANE',
      driver_id: 'drv-1',
      reason: 'Badge réimprimé après une erreur de photo.',
      created_at: atDaysAgo(239, 8),
    }),
    makeLog({
      action: 'driver.archived',
      resource_id: 'drv-5',
      resource_label: 'Issa YAROU',
      driver_id: 'drv-5',
      old_values: { status: 'actif' },
      new_values: { status: 'archive' },
      reason: 'Cessation d’activité déclarée par le conducteur.',
      created_at: atDaysAgo(120, 10),
    }),
    ...['drv-1', 'drv-2', 'drv-1', 'drv-3'].map((driverId, index) =>
      makeLog({
        action: index % 2 === 0 ? 'consultation.qr' : 'consultation.search',
        actor_name: 'Bachirou SANNI',
        actor_role: 'agent',
        resource_id: driverId,
        resource_label: mockDrivers.find((item) => item.id === driverId)?.last_name ?? null,
        driver_id: driverId,
        ip_address: '102.64.10.40',
        created_at: atDaysAgo(index + 1, 7 + index),
      }),
    ),
    // Journal des connexions (onglet « Connexions » de l'administration).
    ...([
      ['kofi.dossou@zemiconnect.exemple', 'Kofi DOSSOU', 'admin', 'reussie', '102.64.10.2', 1, 8],
      ['aicha.toko@zemiconnect.exemple', 'Aïcha TOKO', 'gestionnaire', 'reussie', '102.64.10.21', 1, 9],
      ['inconnu@exemple.com', null, null, 'echouee', '41.85.12.7', 2, 22],
      ['bachirou.sanni@zemiconnect.exemple', 'Bachirou SANNI', 'agent', 'reussie', '102.64.10.40', 2, 7],
      ['bloque@zemiconnect.exemple', null, null, 'bloquee', '41.85.12.7', 3, 23],
      ['aicha.toko@zemiconnect.exemple', 'Aïcha TOKO', 'gestionnaire', 'echouee', '102.64.10.21', 4, 8],
    ] as const).map(([email, name, role, result, ip, days, hour]) =>
      makeLog({
        action: 'auth.login',
        actor_name: name,
        actor_role: role,
        resource_type: null,
        ip_address: ip,
        login_email: email,
        login_result: result,
        user_agent: role === 'agent' ? 'Chrome 141 · Android' : 'Firefox 144 · Windows',
        created_at: atDaysAgo(days, hour),
      }),
    ),
  );
  // Libellés complets pour les consultations.
  logs.forEach((log) => {
    if (log.kind === 'consultation') {
      const found = mockDrivers.find((item) => item.id === log.driver_id);
      log.resource_label = found ? `${found.first_name} ${found.last_name}` : log.resource_label;
    }
  });
  return logs.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Du plus récent au plus ancien. Les mutations fictives y ajoutent leurs entrées.
export const mockLogs: LogEntry[] = seedLogs();

export function pushLog(entry: Partial<LogEntry> & { action: AuditAction }): LogEntry {
  const log = makeLog({ created_at: new Date().toISOString(), ...entry });
  mockLogs.unshift(log);
  return log;
}

