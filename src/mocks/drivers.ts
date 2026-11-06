import type { AgentDriverView } from '@/types/agentDriver';
import type { Document, DocumentType } from '@/types/document';
import type { Driver, PublicDriverProfile } from '@/types/driver';
import type { Assignment, Motorcycle } from '@/types/motorcycle';
import type { QrCode } from '@/types/qr';
import { normalizeZcNumber } from '@/lib/utils/format';
import { atDaysAgo, computeCompliance, computeValidity, inDays } from './compliance';
import { MOCK_DOMAIN } from './users';

/*
 * Données fictives, en mémoire. Les dates sont RELATIVES au jour courant
 * (inDays) pour que les états « expire bientôt » ou « expiré » restent vrais.
 * Les validités et la conformité ne sont pas posées à la main : elles sont
 * calculées par mocks/compliance.ts, comme l'API le ferait. Un document
 * absent est « manquant » ; une date d'expiration nulle n'est jamais inventée.
 * Les mutations (mocks/gestion.ts) modifient ces tableaux jusqu'au
 * rechargement de la page.
 */

const NUMBER_PREFIX: Record<DocumentType, string> = { piece_identite: 'CIP', permis: 'PC', droit_taxi: 'DT-PKU', assurance: 'POL' };

// Numéro fictif stable, dérivé de l'identifiant (ex. PC-2024-418302).
function fakeNumber(type: DocumentType, id: string): string {
  const digits = [...id].reduce((sum, char, index) => (sum * 31 + char.charCodeAt(0) * (index + 1)) % 1000000, 7);
  return `${NUMBER_PREFIX[type]}-2024-${String(digits).padStart(6, '0')}`;
}

export function makeDocument(
  id: string,
  type: DocumentType,
  owner: { type: Document['owner_type']; id: string },
  expiresAt: string | null,
  extra: Partial<Document> = {},
): Document {
  return {
    id,
    type,
    owner_type: owner.type,
    owner_id: owner.id,
    number: fakeNumber(type, id),
    issued_at: inDays(-600),
    expires_at: expiresAt,
    validity: computeValidity(expiresAt),
    has_file: true,
    superseded_at: null,
    created_at: atDaysAgo(240),
    ...extra,
  };
}

function moto(
  id: string,
  plate: string,
  brand: string,
  model: string,
  color: string,
  year: number | null,
  chassis: string | null,
  insuranceExpiry: string | null | 'aucune',
): Motorcycle {
  return {
    id,
    plate_number: plate,
    brand,
    model,
    color,
    year,
    chassis_number: chassis,
    driver_id: null,
    driver_name: null,
    documents: insuranceExpiry === 'aucune' ? [] : [makeDocument(`doc-${id}-a`, 'assurance', { type: 'motorcycle', id }, insuranceExpiry)],
    archived_at: null,
    created_at: atDaysAgo(300),
  };
}

export const mockMotorcycles: Motorcycle[] = [
  moto('mot-1', 'BB 4521 RB', 'Bajaj', 'Boxer BM 150', 'Rouge', 2021, 'MD2A21AY5MW894102', inDays(70)),
  moto('mot-2', 'BB 7310 RB', 'Haojue', 'HJ 125', 'Noir', 2019, 'LC6PCJK69K0012345', inDays(7)),
  moto('mot-3', 'BB 1188 RB', 'TVS', 'Star HLX', 'Bleu', 2018, null, inDays(-66)),
  // Sans conducteur : choix possibles à l'affectation.
  moto('mot-4', 'BB 9042 RB', 'Bajaj', 'Boxer BM 100', 'Rouge', null, null, 'aucune'),
  moto('mot-5', 'BB 3307 RB', 'Haojue', 'HJ 110', 'Bleu', 2022, 'LC6PCJB12N0098761', inDays(236)),
  moto('mot-6', 'BB 5590 RB', 'Bajaj', 'Boxer BM 125', 'Vert', 2020, 'MD2A18AZ3LW551230', null),
  moto('mot-7', 'BB 6618 RB', 'TVS', 'HLX 125', 'Noir', 2023, 'TVS2023-1187', inDays(150)),
  moto('mot-8', 'BB 7710 RB', 'TVS', 'HLX 125', 'Rouge', 2023, 'TVS2023-8841', inDays(12)),
  // Démonstration : affichée libre, mais affectée entre-temps par un autre gestionnaire (voir MOCK_RACE_MOTORCYCLE).
  moto('mot-9', 'BB 1234 RB', 'Haojue', 'HJ 125', 'Bleu', 2021, null, inDays(200)),
];

type Seed = Pick<Driver, 'id' | 'first_name' | 'last_name' | 'status'> & Partial<Driver> & { moto?: string; startedDaysAgo?: number };

function driver(seed: Seed): Driver {
  const { moto: motoId, startedDaysAgo = 200, ...rest } = seed;
  return {
    zc_number: null,
    phone: null,
    address: null,
    birth_date: null,
    driver_identifier: null,
    photo_url: null,
    has_paper_form: false,
    compliance: 'non_conforme',
    motorcycle: null,
    assignment_started_at: motoId ? atDaysAgo(startedDaysAgo) : null,
    managing_structure: null,
    documents: [],
    validated_at: rest.status === 'en_attente' ? null : atDaysAgo(startedDaysAgo),
    archived_at: null,
    created_at: atDaysAgo(startedDaysAgo + 2),
    updated_at: atDaysAgo(20),
    ...rest,
    // Rattachement à la moto, résolu plus bas (linkMotorcycles).
    ...(motoId ? { motorcycle: { id: motoId } as Motorcycle } : {}),
  };
}

const d = (driverId: string, type: DocumentType, expiresAt: string | null, extra?: Partial<Document>) =>
  makeDocument(`doc-${driverId}-${type}`, type, { type: 'driver', id: driverId }, expiresAt, extra);

const STRUCTURE = 'Coopérative des zémidjans de Parakou-Centre (fictive)';

export const mockDrivers: Driver[] = [
  // Actif, conforme ; permis sans date d'expiration (non bloquant).
  driver({
    id: 'drv-1',
    zc_number: 'ZC-482917',
    first_name: 'Moussa',
    last_name: 'ALASSANE',
    phone: '+229 01 96 12 34 56',
    address: 'Quartier Titirou, Parakou',
    birth_date: '1984-05-14',
    driver_identifier: 'CIP-229-48190',
    photo_url: '/mocks/moussa-alassane.jpg',
    has_paper_form: true,
    status: 'actif',
    moto: 'mot-1',
    startedDaysAgo: 240,
    managing_structure: STRUCTURE,
    documents: [d('drv-1', 'piece_identite', inDays(1660)), d('drv-1', 'permis', null), d('drv-1', 'droit_taxi', inDays(146))],
  }),
  // Actif, expire bientôt : assurance de la moto dans 7 jours.
  driver({
    id: 'drv-2',
    zc_number: 'ZC-305611',
    first_name: 'Ibrahim',
    last_name: 'SALIFOU',
    phone: '+229 01 95 22 11 08',
    address: 'Quartier Banikanni, Parakou',
    birth_date: '1990-02-03',
    status: 'actif',
    moto: 'mot-2',
    startedDaysAgo: 220,
    managing_structure: STRUCTURE,
    documents: [d('drv-2', 'piece_identite', inDays(800)), d('drv-2', 'permis', inDays(1240)), d('drv-2', 'droit_taxi', inDays(115))],
  }),
  // Suspendu et non conforme : deux sujets distincts.
  driver({
    id: 'drv-3',
    zc_number: 'ZC-771204',
    first_name: 'Rachidi',
    last_name: 'BIO',
    status: 'suspendu',
    moto: 'mot-3',
    startedDaysAgo: 210,
    documents: [d('drv-3', 'piece_identite', inDays(600)), d('drv-3', 'droit_taxi', inDays(-128))],
  }),
  // En attente, INCOMPLET : ni photo, ni permis, ni moto.
  driver({
    id: 'drv-4',
    first_name: 'Saka',
    last_name: 'GOUNOU',
    phone: '+229 01 94 40 50 60',
    address: 'Quartier Guema, Parakou',
    birth_date: '1997-07-30',
    status: 'en_attente',
    startedDaysAgo: 8,
    documents: [d('drv-4', 'piece_identite', inDays(1200))],
  }),
  driver({
    id: 'drv-5',
    zc_number: 'ZC-664430',
    first_name: 'Issa',
    last_name: 'YAROU',
    status: 'archive',
    startedDaysAgo: 230,
    archived_at: atDaysAgo(120),
    documents: [d('drv-5', 'piece_identite', inDays(300)), d('drv-5', 'permis', inDays(900))],
  }),
  // Actif, non conforme : droit de taxi manquant.
  driver({
    id: 'drv-6',
    zc_number: 'ZC-559013',
    first_name: 'Kassim',
    last_name: 'ORÉ',
    phone: '+229 01 97 31 20 44',
    address: 'Quartier Zongo, Parakou',
    birth_date: '1995-09-21',
    status: 'actif',
    moto: 'mot-5',
    startedDaysAgo: 180,
    documents: [d('drv-6', 'piece_identite', inDays(1900)), d('drv-6', 'permis', inDays(1030))],
  }),
  // Actif, sans moto : l'assurance de la moto ne peut pas être fournie.
  driver({
    id: 'drv-7',
    zc_number: 'ZC-840266',
    first_name: 'Gildas',
    last_name: 'KOUAGOU',
    phone: '+229 01 93 66 18 02',
    birth_date: '1988-12-02',
    status: 'actif',
    startedDaysAgo: 160,
    documents: [d('drv-7', 'piece_identite', inDays(1330)), d('drv-7', 'permis', inDays(1575)), d('drv-7', 'droit_taxi', inDays(85))],
  }),
  // Actif, conforme, documents SANS date d'expiration.
  driver({
    id: 'drv-8',
    zc_number: 'ZC-217745',
    first_name: 'Yacoubou',
    last_name: 'BANI',
    phone: '+229 01 92 05 77 31',
    address: 'Quartier Albarika, Parakou',
    birth_date: '1979-03-08',
    driver_identifier: 'REG-PKU-0217',
    status: 'actif',
    moto: 'mot-6',
    startedDaysAgo: 150,
    documents: [d('drv-8', 'piece_identite', null), d('drv-8', 'permis', null), d('drv-8', 'droit_taxi', null)],
  }),
  // En attente, COMPLET : prêt à être validé (démonstration de la validation).
  driver({
    id: 'drv-9',
    first_name: 'Fousséni',
    last_name: 'TANKO',
    phone: '+229 01 97 02 14 78',
    address: 'Quartier Dépôt, Parakou',
    birth_date: '1992-11-19',
    photo_url: '/mocks/photo-fictive.png',
    status: 'en_attente',
    moto: 'mot-7',
    startedDaysAgo: 3,
    documents: [d('drv-9', 'piece_identite', inDays(2100)), d('drv-9', 'permis', inDays(1400)), d('drv-9', 'droit_taxi', inDays(320))],
  }),
];

export const mockAssignments: Assignment[] = [];

// Documents remplacés (renouvellements) : l'historique, hors documents actuels.
export const mockDocumentHistory: Document[] = [
  d('drv-1', 'droit_taxi', inDays(-219), { id: 'doc-drv-1-droit_taxi-old', number: 'DT-PKU-2023-000412', issued_at: inDays(-584), superseded_at: atDaysAgo(220) }),
];

// Conformité recalculée (mode fictif) à partir des documents actuels du
// conducteur et de l'assurance de sa moto actuelle.
export function refreshCompliance(item: Driver): void {
  item.documents.forEach((document) => (document.validity = computeValidity(document.expires_at)));
  item.motorcycle?.documents.forEach((document) => (document.validity = computeValidity(document.expires_at)));
  item.compliance = computeCompliance([...item.documents, ...(item.motorcycle?.documents ?? [])]);
}

// Lie conducteurs et motos, crée les affectations en cours, puis calcule la conformité.
function linkMotorcycles() {
  for (const item of mockDrivers) {
    const motoId = item.motorcycle?.id;
    const found = motoId ? mockMotorcycles.find((candidate) => candidate.id === motoId) : undefined;
    item.motorcycle = found ?? null;
    if (found) {
      found.driver_id = item.id;
      found.driver_name = `${item.first_name} ${item.last_name}`;
      mockAssignments.push({
        id: `asg-${item.id}`,
        driver_id: item.id,
        driver_name: found.driver_name,
        motorcycle_id: found.id,
        plate_number: found.plate_number,
        started_at: item.assignment_started_at ?? item.created_at,
        ended_at: null,
        reason: 'Première affectation',
      });
    }
  }
  // Affectation passée de Moussa, clôturée (historique).
  mockAssignments.push({
    id: 'asg-drv-1-old',
    driver_id: 'drv-1',
    driver_name: 'Moussa ALASSANE',
    motorcycle_id: 'mot-4',
    plate_number: 'BB 9042 RB',
    started_at: atDaysAgo(420),
    ended_at: atDaysAgo(240),
    reason: 'Première affectation',
  });
  mockDrivers.forEach(refreshCompliance);
}

function qr(id: string, driverId: string, token: string, issuedDaysAgo: number, revokedDaysAgo: number | null = null, reason: string | null = null): QrCode {
  return {
    id,
    driver_id: driverId,
    token,
    public_url: `https://${MOCK_DOMAIN}/v/${token}`,
    status: revokedDaysAgo === null ? 'actif' : 'revoque',
    issued_at: atDaysAgo(issuedDaysAgo),
    revoked_at: revokedDaysAgo === null ? null : atDaysAgo(revokedDaysAgo),
    revoke_reason: reason,
  };
}

export const mockQrCodes: QrCode[] = [
  qr('qr-1', 'drv-1', 'demo-moussa', 239),
  qr('qr-2', 'drv-2', 'demo-ibrahim', 220),
  qr('qr-3', 'drv-3', 'demo-rachidi', 210),
  // QR d'un conducteur archivé : révoqué à l'archivage.
  qr('qr-5', 'drv-5', 'demo-archive', 230, 120, 'Dossier archivé'),
  qr('qr-6', 'drv-6', 'demo-kassim', 180),
  qr('qr-7', 'drv-7', 'demo-sans-moto', 160),
  qr('qr-8', 'drv-8', 'demo-sans-date', 150),
  qr('qr-1-old', 'drv-1', 'demo-revoque', 240, 239, 'Badge réimprimé après une erreur de photo.'),
];

linkMotorcycles();

// Projection publique, champ par champ (jamais de spread : aucun champ privé
// ne doit passer). null pour un conducteur en attente ou archivé, que l'API
// publique traite comme introuvable.
export function toPublicProfile(item: Driver): PublicDriverProfile | null {
  if ((item.status !== 'actif' && item.status !== 'suspendu') || !item.zc_number) return null;
  return {
    zc_number: item.zc_number,
    first_name: item.first_name,
    last_name: item.last_name,
    photo_url: item.photo_url,
    status: item.status,
    motorcycle: item.motorcycle
      ? { plate_number: item.motorcycle.plate_number, brand: item.motorcycle.brand, color: item.motorcycle.color }
      : null,
    managing_structure: item.managing_structure,
  };
}

// Projection agent (AG3), champ par champ : documents en texte, sans fichier.
// L'assurance vient de la moto ACTUELLE. `consulted_at` simule l'horodatage
// que l'API pose en enregistrant la consultation.
export function toAgentView(item: Driver): AgentDriverView {
  const documents = [...item.documents, ...(item.motorcycle?.documents ?? [])].map((document) => ({
    type: document.type,
    number: document.number,
    issued_at: document.issued_at,
    expires_at: document.expires_at,
    validity: document.validity,
  }));
  return {
    zc_number: item.zc_number ?? '—',
    first_name: item.first_name,
    last_name: item.last_name,
    photo_url: item.photo_url,
    phone: item.phone,
    address: item.address,
    birth_date: item.birth_date,
    driver_identifier: item.driver_identifier,
    status: item.status,
    compliance: item.compliance,
    motorcycle: item.motorcycle
      ? {
          plate_number: item.motorcycle.plate_number,
          brand: item.motorcycle.brand,
          model: item.motorcycle.model,
          color: item.motorcycle.color,
          year: item.motorcycle.year,
          chassis_number: item.motorcycle.chassis_number,
        }
      : null,
    documents,
    consulted_at: new Date().toISOString(),
  };
}

// Résolution d'un jeton QR actif vers son conducteur (null si inconnu ou révoqué).
export function findDriverByActiveToken(token: string): Driver | null {
  const code = mockQrCodes.find((item) => item.token === token && item.status === 'actif');
  return code ? (mockDrivers.find((item) => item.id === code.driver_id) ?? null) : null;
}

// Comparaison sans casse ni espaces : le format du numéro n'est pas arrêté.
export const normalizeLookup = normalizeZcNumber;
