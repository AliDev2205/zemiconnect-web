import { MockApiError, paginate } from '@/lib/api/mock';
import { missingActivationItems } from '@/lib/drivers/activation';
import { normalizeZcNumber } from '@/lib/utils/format';
import type { Paginated } from '@/types/api';
import type { DashboardStats, TodoItem } from '@/types/dashboard';
import type { Document, DocumentType, FileLink } from '@/types/document';
import type { Driver, DriverFilters, DriverIdentityPayload, DuplicateMatch } from '@/types/driver';
import type { LogEntry } from '@/types/log';
import type { Assignment, Motorcycle, MotorcycleFilters, MotorcyclePayload } from '@/types/motorcycle';
import type { QrCode } from '@/types/qr';
import { makeDocument, mockAssignments, mockDocumentHistory, mockDrivers, mockMotorcycles, mockQrCodes, refreshCompliance } from './drivers';
import { mockLogs, pushLog } from './logs';
import { mockActor } from './session';
import { MOCK_DOMAIN, mockUsers } from './users';

/*
 * Magasin fictif de l'espace gestion : il applique, en mémoire, les règles que
 * l'API appliquera (et refuse comme elle le ferait, par MockApiError). Les
 * services l'appellent par runMock() quand NEXT_PUBLIC_API_MOCK=true.
 */

export interface DocumentInput {
  type: DocumentType;
  number: string;
  issued_at: string;
  expires_at: string | null;
  file: File | null;
}

export interface AssignmentInput {
  motorcycle_id: string;
  started_at?: string;
  reason?: string;
}

// Moto montrée comme libre mais affectée entre-temps : démontre le refus
// « Cette moto est déjà affectée à un autre conducteur » (concurrence).
export const MOCK_RACE_MOTORCYCLE = 'mot-9';

// Motifs de démonstration des erreurs dans les modales de confirmation :
// ERREUR-DEMO → bandeau (503) ; REFUS-DEMO → erreur 422 sous le champ Motif.
function demoFailure(reason: string) {
  if (reason.includes('ERREUR-DEMO')) throw new MockApiError(503, 'Le service est momentanément indisponible. Réessayez.');
  if (reason.includes('REFUS-DEMO')) throw new MockApiError(422, 'Motif refusé.', { reason: ['Ce motif est refusé par le serveur (démonstration).'] });
}

const fullName = (driver: Pick<Driver, 'first_name' | 'last_name'>) => `${driver.first_name} ${driver.last_name}`;
const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function audit(driver: Driver, entry: Omit<Parameters<typeof pushLog>[0], 'driver_id'>) {
  const actor = mockActor();
  pushLog({ actor_name: actor.name, actor_role: actor.role, resource_id: driver.id, resource_label: fullName(driver), driver_id: driver.id, ...entry });
}

function findDriver(id: string): Driver {
  const driver = mockDrivers.find((item) => item.id === id);
  if (!driver) throw new MockApiError(404, 'Conducteur introuvable.');
  return driver;
}

function editable(driver: Driver): Driver {
  if (driver.status === 'archive') throw new MockApiError(409, 'Ce dossier est archivé : il ne peut plus être modifié.');
  return driver;
}

function findMotorcycle(id: string): Motorcycle {
  const moto = mockMotorcycles.find((item) => item.id === id);
  if (!moto) throw new MockApiError(404, 'Moto introuvable.');
  return moto;
}

function matchesDriver(driver: Driver, search: string): boolean {
  const needle = search.trim().toLowerCase();
  const compact = normalizeZcNumber(search);
  return (
    [driver.first_name, driver.last_name, fullName(driver), driver.driver_identifier ?? ''].some((field) => field.toLowerCase().includes(needle)) ||
    [driver.zc_number ?? '', driver.phone ?? '', driver.motorcycle?.plate_number ?? ''].some((field) => normalizeZcNumber(field).includes(compact))
  );
}

function newZcNumber(): string {
  let number = '';
  do number = `ZC-${String(100000 + Math.floor(Math.random() * 900000))}`;
  while (mockDrivers.some((driver) => driver.zc_number === number));
  return number;
}

function issueQr(driver: Driver): QrCode {
  const token = `qr${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const code: QrCode = {
    id: uid('qr'),
    driver_id: driver.id,
    token,
    public_url: `https://${MOCK_DOMAIN}/v/${token}`,
    status: 'actif',
    issued_at: now(),
    revoked_at: null,
    revoke_reason: null,
  };
  mockQrCodes.unshift(code);
  return code;
}

function revokeActiveQr(driverId: string, reason: string) {
  mockQrCodes
    .filter((code) => code.driver_id === driverId && code.status === 'actif')
    .forEach((code) => Object.assign(code, { status: 'revoque', revoked_at: now(), revoke_reason: reason }));
}

function closeAssignment(driver: Driver, endedAt: string, reason?: string) {
  const current = mockAssignments.find((item) => item.driver_id === driver.id && item.ended_at === null);
  if (current) Object.assign(current, { ended_at: endedAt, reason: current.reason ?? reason ?? null });
  if (driver.motorcycle) Object.assign(driver.motorcycle, { driver_id: null, driver_name: null });
  driver.motorcycle = null;
  driver.assignment_started_at = null;
}

function todoFor(driver: Driver, validity: 'expire' | 'expire_bientot'): TodoItem[] {
  const documents = [...driver.documents.filter((item) => item.type !== 'piece_identite'), ...(driver.motorcycle?.documents ?? [])];
  return documents
    .filter((document) => document.validity === validity)
    .map((document) => ({ driver_id: driver.id, driver_name: fullName(driver), document_type: document.type, date: document.expires_at }));
}

export const gestionStore = {
  listDrivers(filters: DriverFilters): Paginated<Driver> {
    const rows = mockDrivers
      .filter(
        (driver) =>
          (!filters.search || matchesDriver(driver, filters.search)) &&
          (!filters.status || driver.status === filters.status) &&
          (!filters.compliance || driver.compliance === filters.compliance) &&
          (!filters.registered_from || driver.created_at.slice(0, 10) >= filters.registered_from) &&
          (!filters.registered_to || driver.created_at.slice(0, 10) <= filters.registered_to),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return paginate(rows, filters.page, filters.per_page ?? 10);
  },

  getDriver: findDriver,

  // Doublons possibles : même téléphone, même identifiant, ou mêmes nom et prénom.
  duplicates(input: Partial<DriverIdentityPayload>, excludeId?: string): DuplicateMatch[] {
    const same = (a?: string | null, b?: string | null) => !!a && !!b && normalizeZcNumber(a) === normalizeZcNumber(b);
    return mockDrivers
      .filter((driver) => driver.id !== excludeId)
      .map((driver) => ({
        driver,
        reasons: [
          ...(same(input.phone, driver.phone) ? (['phone'] as const) : []),
          ...(same(input.driver_identifier, driver.driver_identifier) ? (['identifier'] as const) : []),
          ...(same(input.last_name, driver.last_name) && same(input.first_name, driver.first_name) ? (['name'] as const) : []),
        ],
      }))
      .filter((match) => match.reasons.length > 0)
      .map(({ driver, reasons }) => ({ id: driver.id, name: fullName(driver), zc_number: driver.zc_number, status: driver.status, reasons }));
  },

  // Dossier créé EN ATTENTE dès la fin de l'étape Identité.
  createDriver(payload: DriverIdentityPayload, paperForm: File | null): Driver {
    const driver: Driver = {
      id: uid('drv'),
      zc_number: null,
      ...payload,
      photo_url: null,
      has_paper_form: !!paperForm,
      status: 'en_attente',
      compliance: 'non_conforme',
      motorcycle: null,
      assignment_started_at: null,
      managing_structure: null,
      documents: [],
      validated_at: null,
      archived_at: null,
      created_at: now(),
      updated_at: now(),
    };
    mockDrivers.unshift(driver);
    refreshCompliance(driver);
    audit(driver, { action: 'driver.created' });
    return driver;
  },

  updateDriver(id: string, payload: DriverIdentityPayload, paperForm: File | null): Driver {
    const driver = editable(findDriver(id));
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};
    (Object.keys(payload) as (keyof DriverIdentityPayload)[]).forEach((key) => {
      if ((driver[key] ?? null) !== (payload[key] ?? null)) {
        oldValues[key] = driver[key];
        newValues[key] = payload[key];
      }
    });
    Object.assign(driver, payload, { updated_at: now(), has_paper_form: driver.has_paper_form || !!paperForm });
    if (Object.keys(newValues).length > 0) audit(driver, { action: 'driver.updated', old_values: oldValues, new_values: newValues });
    return driver;
  },

  setPhoto(id: string, url: string): Driver {
    const driver = editable(findDriver(id));
    driver.photo_url = url;
    audit(driver, { action: 'driver.photo_updated' });
    return driver;
  },

  listMotorcycles(filters: MotorcycleFilters): Paginated<Motorcycle> {
    const needle = normalizeZcNumber(filters.search ?? '');
    const rows = mockMotorcycles.filter(
      (moto) =>
        // Le choix d'une moto à affecter exclut les motos archivées ; la liste GE5 les montre.
        (!filters.unassigned || (!moto.driver_id && !moto.archived_at)) &&
        (!needle || [moto.plate_number, moto.brand ?? '', moto.model ?? '', moto.driver_name ?? ''].some((field) => normalizeZcNumber(field).includes(needle))),
    );
    return paginate(rows, filters.page, filters.per_page ?? 10);
  },

  createMotorcycle(payload: MotorcyclePayload): Motorcycle {
    if (mockMotorcycles.some((moto) => normalizeZcNumber(moto.plate_number) === normalizeZcNumber(payload.plate_number))) {
      throw new MockApiError(422, 'Cette immatriculation existe déjà.', { plate_number: ['Cette immatriculation existe déjà.'] });
    }
    const moto: Motorcycle = { id: uid('mot'), ...payload, driver_id: null, driver_name: null, documents: [], archived_at: null, created_at: now() };
    mockMotorcycles.unshift(moto);
    pushLog({ ...mockActorEntry(), action: 'motorcycle.created', resource_type: 'motorcycle', resource_id: moto.id, resource_label: moto.plate_number });
    return moto;
  },

  getMotorcycle: findMotorcycle,

  updateMotorcycle(id: string, payload: MotorcyclePayload): Motorcycle {
    const moto = findMotorcycle(id);
    if (moto.archived_at) throw new MockApiError(409, 'Cette moto est archivée : elle ne peut plus être modifiée.');
    if (mockMotorcycles.some((other) => other.id !== id && normalizeZcNumber(other.plate_number) === normalizeZcNumber(payload.plate_number))) {
      throw new MockApiError(422, 'Cette immatriculation existe déjà.', { plate_number: ['Cette immatriculation existe déjà.'] });
    }
    const old: Record<string, unknown> = {};
    const next: Record<string, unknown> = {};
    (Object.keys(payload) as (keyof MotorcyclePayload)[]).forEach((key) => {
      if ((moto[key] ?? null) !== (payload[key] ?? null)) {
        old[key] = moto[key];
        next[key] = payload[key];
      }
    });
    Object.assign(moto, payload);
    // Les affectations gardent l'immatriculation à jour.
    mockAssignments.filter((item) => item.motorcycle_id === id).forEach((item) => (item.plate_number = moto.plate_number));
    if (Object.keys(next).length > 0) pushLog({ ...mockActorEntry(), action: 'motorcycle.updated', resource_type: 'motorcycle', resource_id: id, resource_label: moto.plate_number, old_values: old, new_values: next });
    return moto;
  },

  // Archivage (pas de suppression) : refusé tant que la moto est affectée.
  archiveMotorcycle(id: string): Motorcycle {
    const moto = findMotorcycle(id);
    if (moto.driver_id) throw new MockApiError(409, "Changez d'abord la moto du conducteur.");
    moto.archived_at = now();
    pushLog({ ...mockActorEntry(), action: 'motorcycle.archived', resource_type: 'motorcycle', resource_id: id, resource_label: moto.plate_number });
    return moto;
  },

  motorcycleAssignments(id: string): Assignment[] {
    findMotorcycle(id);
    return mockAssignments.filter((item) => item.motorcycle_id === id).sort((a, b) => b.started_at.localeCompare(a.started_at));
  },

  // Affecte une moto SANS conducteur ; l'affectation en cours est clôturée.
  assign(driverId: string, input: AssignmentInput): Driver {
    const driver = editable(findDriver(driverId));
    const moto = findMotorcycle(input.motorcycle_id);
    if ((moto.driver_id && moto.driver_id !== driver.id) || moto.id === MOCK_RACE_MOTORCYCLE) {
      const message = 'Cette moto est déjà affectée à un autre conducteur.';
      throw new MockApiError(422, message, { motorcycle_id: [message] });
    }
    const startedAt = input.started_at ? new Date(`${input.started_at}T09:00:00Z`).toISOString() : now();
    const previous = driver.motorcycle?.plate_number;
    closeAssignment(driver, startedAt, input.reason);
    moto.driver_id = driver.id;
    moto.driver_name = fullName(driver);
    driver.motorcycle = moto;
    driver.assignment_started_at = startedAt;
    mockAssignments.unshift({
      id: uid('asg'),
      driver_id: driver.id,
      driver_name: fullName(driver),
      motorcycle_id: moto.id,
      plate_number: moto.plate_number,
      started_at: startedAt,
      ended_at: null,
      reason: input.reason ?? null,
    });
    refreshCompliance(driver);
    audit(driver, { action: 'assignment.changed', detail: moto.plate_number, old_values: previous ? { moto: previous } : null, new_values: { moto: moto.plate_number }, reason: input.reason ?? null });
    return driver;
  },

  assignments(driverId: string): Assignment[] {
    return mockAssignments.filter((item) => item.driver_id === driverId).sort((a, b) => b.started_at.localeCompare(a.started_at));
  },

  // Ajout ou renouvellement : le document actuel du même type passe dans l'historique.
  addDocument(owner: { type: 'driver' | 'motorcycle'; id: string }, input: DocumentInput): Document {
    if (input.type === 'assurance' && !input.expires_at) {
      throw new MockApiError(422, "La date d'expiration de l'assurance est obligatoire.", { expires_at: ["La date d'expiration de l'assurance est obligatoire."] });
    }
    const holder = owner.type === 'driver' ? editable(findDriver(owner.id)) : findMotorcycle(owner.id);
    const previous = holder.documents.find((item) => item.type === input.type);
    if (previous) {
      previous.superseded_at = now();
      mockDocumentHistory.unshift(previous);
    }
    const document = makeDocument(uid('doc'), input.type, owner, input.expires_at, {
      number: input.number || null,
      issued_at: input.issued_at || null,
      has_file: !!input.file,
      created_at: now(),
    });
    holder.documents = [...holder.documents.filter((item) => item.type !== input.type), document];
    const drivers = owner.type === 'driver' ? [holder as Driver] : mockDrivers.filter((item) => item.motorcycle?.id === owner.id);
    drivers.forEach((driver) => {
      refreshCompliance(driver);
      audit(driver, { action: previous ? 'document.renewed' : 'document.added', resource_type: 'document', detail: input.type });
    });
    return document;
  },

  documentHistory(owner: { type: 'driver' | 'motorcycle'; id: string }): Document[] {
    return mockDocumentHistory.filter((item) => item.owner_type === owner.type && item.owner_id === owner.id);
  },

  // URL temporaire d'un fichier (mode fictif : un PDF d'exemple).
  fileLink(documentId: string): FileLink {
    const all = [...mockDrivers.flatMap((driver) => driver.documents), ...mockMotorcycles.flatMap((moto) => moto.documents), ...mockDocumentHistory];
    const document = all.find((item) => item.id === documentId);
    if (!document?.has_file) throw new MockApiError(404, 'Aucun fichier pour ce document.');
    return { url: '/mocks/document-exemple.pdf', expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() };
  },

  // Validation : numéro ZemiConnect et QR générés, statut Actif.
  validate(id: string): Driver {
    const driver = findDriver(id);
    if (driver.status !== 'en_attente') throw new MockApiError(409, "Ce dossier n'est pas en attente.");
    const missing = missingActivationItems(driver);
    if (missing.length > 0) throw new MockApiError(422, 'Le dossier est incomplet.', { activation: missing });
    Object.assign(driver, { zc_number: newZcNumber(), status: 'actif', validated_at: now(), updated_at: now() });
    issueQr(driver);
    audit(driver, { action: 'driver.validated', old_values: { status: 'en_attente' }, new_values: { status: 'actif', zc_number: driver.zc_number } });
    audit(driver, { action: 'qr.generated', resource_type: 'qr_code' });
    return driver;
  },

  // Suspendre / réactiver. N'agit jamais sur la conformité.
  setStatus(id: string, status: 'actif' | 'suspendu', reason: string): Driver {
    demoFailure(reason);
    const driver = findDriver(id);
    const allowed = status === 'suspendu' ? driver.status === 'actif' : driver.status === 'suspendu';
    if (!allowed) throw new MockApiError(409, "Ce changement de statut n'est pas possible.");
    const old = driver.status;
    Object.assign(driver, { status, updated_at: now() });
    audit(driver, { action: status === 'suspendu' ? 'driver.suspended' : 'driver.reactivated', old_values: { status: old }, new_values: { status }, reason });
    return driver;
  },

  // Archivage (pas de suppression) : QR révoqué, affectation clôturée.
  archive(id: string, reason: string): Driver {
    demoFailure(reason);
    const driver = editable(findDriver(id));
    const old = driver.status;
    revokeActiveQr(driver.id, 'Dossier archivé');
    closeAssignment(driver, now(), 'Dossier archivé');
    Object.assign(driver, { status: 'archive', archived_at: now(), updated_at: now() });
    refreshCompliance(driver);
    audit(driver, { action: 'driver.archived', old_values: { status: old }, new_values: { status: 'archive' }, reason });
    return driver;
  },

  qrCodes(driverId: string): QrCode[] {
    return mockQrCodes.filter((code) => code.driver_id === driverId).sort((a, b) => b.issued_at.localeCompare(a.issued_at));
  },

  regenerateQr(driverId: string, reason: string): QrCode {
    demoFailure(reason);
    const driver = editable(findDriver(driverId));
    if (driver.status === 'en_attente') throw new MockApiError(409, "Le QR n'existe qu'après la validation du dossier.");
    revokeActiveQr(driver.id, reason);
    const code = issueQr(driver);
    audit(driver, { action: 'qr.regenerated', resource_type: 'qr_code', reason });
    return code;
  },

  revokeQr(driverId: string, reason: string): QrCode {
    demoFailure(reason);
    const driver = findDriver(driverId);
    const active = mockQrCodes.find((code) => code.driver_id === driverId && code.status === 'actif');
    if (!active) throw new MockApiError(409, 'Aucun QR actif pour ce conducteur.');
    revokeActiveQr(driverId, reason);
    audit(driver, { action: 'qr.revoked', resource_type: 'qr_code', reason });
    return active;
  },

  // Fil chronologique de la fiche : audit et consultations des agents.
  history(driverId: string): LogEntry[] {
    findDriver(driverId);
    return mockLogs.filter((log) => log.driver_id === driverId);
  },

  dashboard(): DashboardStats {
    const live = mockDrivers.filter((driver) => driver.status === 'actif' || driver.status === 'suspendu');
    const count = <K extends string>(keys: K[], value: (driver: Driver) => K, list = mockDrivers) =>
      Object.fromEntries(keys.map((key) => [key, list.filter((driver) => value(driver) === key).length])) as Record<K, number>;
    const byDate = (a: TodoItem, b: TodoItem) => (a.date ?? '').localeCompare(b.date ?? '');
    return {
      drivers_total: mockDrivers.length,
      drivers_by_status: count(['en_attente', 'actif', 'suspendu', 'archive'], (driver) => driver.status),
      active_by_compliance: count(['conforme', 'expire_bientot', 'non_conforme'], (driver) => driver.compliance, mockDrivers.filter((driver) => driver.status === 'actif')),
      motorcycles_total: mockMotorcycles.filter((moto) => !moto.archived_at).length,
      motorcycles_unassigned: mockMotorcycles.filter((moto) => !moto.archived_at && !moto.driver_id).length,
      agents_active: mockUsers.filter((user) => user.role === 'agent' && user.account_status === 'actif').length,
      todo: {
        expired: live.flatMap((driver) => todoFor(driver, 'expire')).sort(byDate),
        expiring: live.flatMap((driver) => todoFor(driver, 'expire_bientot')).sort(byDate),
        pending: mockDrivers
          .filter((driver) => driver.status === 'en_attente')
          .map((driver) => ({ driver_id: driver.id, driver_name: fullName(driver), document_type: null, date: driver.created_at, missing: missingActivationItems(driver) })),
      },
    };
  },
};

function mockActorEntry() {
  const actor = mockActor();
  return { actor_name: actor.name, actor_role: actor.role };
}

// Démonstration du premier lancement (registre vide) : ajouter ?demo=vide à
// l'adresse de /gestion ou /gestion/conducteurs. Mode fictif uniquement.
export function isEmptyRegistryDemo(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'vide';
}

export const EMPTY_DASHBOARD: DashboardStats = {
  drivers_total: 0,
  drivers_by_status: { en_attente: 0, actif: 0, suspendu: 0, archive: 0 },
  active_by_compliance: { conforme: 0, expire_bientot: 0, non_conforme: 0 },
  motorcycles_total: 0,
  motorcycles_unassigned: 0,
  agents_active: 0,
  todo: { expired: [], expiring: [], pending: [] },
};
