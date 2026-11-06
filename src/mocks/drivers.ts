import type { DriverControl } from '@/types/control';
import type { Document } from '@/types/document';
import type { Driver, PublicDriverProfile } from '@/types/driver';
import type { Motorcycle } from '@/types/motorcycle';
import type { QrCode } from '@/types/qr';
import { normalizeZcNumber } from '@/lib/utils/format';
import { MOCK_DOMAIN } from './users';

// Données fictives. Les dates d'expiration à null sont volontaires : un
// document peut ne pas expirer, on n'en invente jamais. Les validités et la
// conformité sont posées à la main, comme si l'API les avait calculées
// (« expire bientôt » = dans les 30 jours, au 5 novembre 2026).

const NUMBER_PREFIX: Record<Document['type'], string> = { piece_identite: 'CIP', permis: 'PC', droit_taxi: 'DT-PKU', assurance: 'POL' };

// Numéro fictif stable, dérivé de l'identifiant (ex. PC-2024-418302).
function fakeNumber(type: Document['type'], id: string): string {
  const digits = [...id].reduce((sum, char, index) => (sum * 31 + char.charCodeAt(0) * (index + 1)) % 1000000, 7);
  return `${NUMBER_PREFIX[type]}-2024-${String(digits).padStart(6, '0')}`;
}

function doc(
  id: string,
  type: Document['type'],
  ownerType: Document['owner_type'],
  ownerId: string,
  expiresAt: string | null,
  validity: Document['validity'],
): Document {
  return {
    id,
    type,
    owner_type: ownerType,
    owner_id: ownerId,
    number: validity === 'manquant' ? null : fakeNumber(type, id),
    issued_at: validity === 'manquant' ? null : '2024-03-15',
    expires_at: expiresAt,
    validity,
    file_url: null,
    created_at: '2026-03-01T09:00:00Z',
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
  driver: [string, string] | null,
  insurance: [string | null, Document['validity']],
): Motorcycle {
  return {
    id,
    plate_number: plate,
    brand,
    model,
    color,
    year,
    chassis_number: chassis,
    driver_id: driver?.[0] ?? null,
    driver_name: driver?.[1] ?? null,
    documents: [doc(`doc-${id}-a`, 'assurance', 'motorcycle', id, insurance[0], insurance[1])],
    created_at: '2026-03-01T09:00:00Z',
  };
}

export const mockMotorcycles: Motorcycle[] = [
  moto('mot-1', 'BB 4521 RB', 'Bajaj', 'Boxer BM 150', 'Rouge', 2021, 'MD2A21AY5MW894102', ['drv-1', 'Moussa ALASSANE'], ['2027-01-15', 'valide']),
  moto('mot-2', 'BB 7310 RB', 'Haojue', 'HJ 125', 'Noir', 2019, 'LC6PCJK69K0012345', ['drv-2', 'Ibrahim SALIFOU'], ['2026-11-12', 'expire_bientot']),
  moto('mot-3', 'BB 1188 RB', 'TVS', 'Star HLX', 'Bleu', 2018, null, ['drv-3', 'Rachidi BIO'], ['2026-08-31', 'expire']),
  moto('mot-4', 'BB 9042 RB', 'Bajaj', 'Boxer BM 100', 'Rouge', null, null, null, [null, 'manquant']),
  moto('mot-5', 'BB 3307 RB', 'Haojue', 'HJ 110', 'Bleu', 2022, 'LC6PCJB12N0098761', ['drv-6', 'Kassim ORÉ'], ['2027-06-30', 'valide']),
  moto('mot-6', 'BB 5590 RB', 'Bajaj', 'Boxer BM 125', 'Vert', 2020, 'MD2A18AZ3LW551230', ['drv-8', 'Yacoubou BANI'], [null, 'valide']),
];

const motorcycle = (id: string) => mockMotorcycles.find((item) => item.id === id) ?? null;

type DriverSeed = Omit<Driver, 'created_at' | 'updated_at' | 'managing_structure' | 'address' | 'birth_date' | 'driver_identifier'> &
  Partial<Pick<Driver, 'managing_structure' | 'address' | 'birth_date' | 'driver_identifier'>>;

function driver(seed: DriverSeed): Driver {
  return {
    managing_structure: null,
    address: null,
    birth_date: null,
    driver_identifier: null,
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-10-12T09:00:00Z',
    ...seed,
  };
}

const STRUCTURE = 'Coopérative des zémidjans de Parakou-Centre (fictive)';

export const mockDrivers: Driver[] = [
  // Conforme ; permis sans date d'expiration, ce qui n'est pas bloquant.
  driver({
    id: 'drv-1',
    zc_number: 'ZC-482917',
    first_name: 'Moussa',
    last_name: 'ALASSANE',
    phone: '+229 01 96 12 34 56',
    address: 'Quartier Titirou, Parakou',
    birth_date: '1984-05-14',
    driver_identifier: 'CIP-229-48190',
    // Photo fictive locale (public/mocks/), pour illustrer next/image.
    photo_url: '/mocks/moussa-alassane.jpg',
    status: 'actif',
    compliance: 'conforme',
    motorcycle: motorcycle('mot-1'),
    managing_structure: STRUCTURE,
    documents: [
      doc('doc-d1-i', 'piece_identite', 'driver', 'drv-1', '2031-05-20', 'valide'),
      doc('doc-d1-p', 'permis', 'driver', 'drv-1', null, 'valide'),
      doc('doc-d1-t', 'droit_taxi', 'driver', 'drv-1', '2027-03-31', 'valide'),
    ],
  }),
  // Expire bientôt : assurance de la moto au 12/11/2026.
  driver({
    id: 'drv-2',
    zc_number: 'ZC-305611',
    first_name: 'Ibrahim',
    last_name: 'SALIFOU',
    phone: '+229 01 95 22 11 08',
    address: 'Quartier Banikanni, Parakou',
    birth_date: '1990-02-03',
    photo_url: null,
    status: 'actif',
    compliance: 'expire_bientot',
    motorcycle: motorcycle('mot-2'),
    managing_structure: STRUCTURE,
    documents: [
      doc('doc-d2-i', 'piece_identite', 'driver', 'drv-2', '2029-01-10', 'valide'),
      doc('doc-d2-p', 'permis', 'driver', 'drv-2', '2030-04-01', 'valide'),
      doc('doc-d2-t', 'droit_taxi', 'driver', 'drv-2', '2027-02-28', 'valide'),
    ],
  }),
  // Suspendu et non conforme.
  driver({
    id: 'drv-3',
    zc_number: 'ZC-771204',
    first_name: 'Rachidi',
    last_name: 'BIO',
    phone: null,
    photo_url: null,
    status: 'suspendu',
    compliance: 'non_conforme',
    motorcycle: motorcycle('mot-3'),
    documents: [
      doc('doc-d3-i', 'piece_identite', 'driver', 'drv-3', '2028-07-02', 'valide'),
      doc('doc-d3-p', 'permis', 'driver', 'drv-3', null, 'manquant'),
      doc('doc-d3-t', 'droit_taxi', 'driver', 'drv-3', '2026-06-30', 'expire'),
    ],
  }),
  driver({
    id: 'drv-4',
    zc_number: 'ZC-120958',
    first_name: 'Saka',
    last_name: 'GOUNOU',
    phone: '+229 01 94 40 50 60',
    photo_url: null,
    status: 'en_attente',
    compliance: 'non_conforme',
    motorcycle: null,
    documents: [
      doc('doc-d4-i', 'piece_identite', 'driver', 'drv-4', '2030-02-14', 'valide'),
      doc('doc-d4-p', 'permis', 'driver', 'drv-4', null, 'manquant'),
      doc('doc-d4-t', 'droit_taxi', 'driver', 'drv-4', null, 'manquant'),
    ],
  }),
  driver({
    id: 'drv-5',
    zc_number: 'ZC-664430',
    first_name: 'Issa',
    last_name: 'YAROU',
    phone: null,
    photo_url: null,
    status: 'archive',
    compliance: 'non_conforme',
    motorcycle: null,
    documents: [],
  }),
  // Actif, non conforme : droit de taxi manquant (absent de la liste).
  driver({
    id: 'drv-6',
    zc_number: 'ZC-559013',
    first_name: 'Kassim',
    last_name: 'ORÉ',
    phone: '+229 01 97 31 20 44',
    address: 'Quartier Zongo, Parakou',
    birth_date: '1995-09-21',
    photo_url: null,
    status: 'actif',
    compliance: 'non_conforme',
    motorcycle: motorcycle('mot-5'),
    documents: [
      doc('doc-d6-i', 'piece_identite', 'driver', 'drv-6', '2032-01-15', 'valide'),
      doc('doc-d6-p', 'permis', 'driver', 'drv-6', '2029-09-01', 'valide'),
    ],
  }),
  // Actif, sans moto : l'assurance de la moto ne peut pas être fournie.
  driver({
    id: 'drv-7',
    zc_number: 'ZC-840266',
    first_name: 'Gildas',
    last_name: 'KOUAGOU',
    phone: '+229 01 93 66 18 02',
    address: null,
    birth_date: '1988-12-02',
    photo_url: null,
    status: 'actif',
    compliance: 'non_conforme',
    motorcycle: null,
    documents: [
      doc('doc-d7-i', 'piece_identite', 'driver', 'drv-7', '2030-06-30', 'valide'),
      doc('doc-d7-p', 'permis', 'driver', 'drv-7', '2031-02-28', 'valide'),
      doc('doc-d7-t', 'droit_taxi', 'driver', 'drv-7', '2027-01-31', 'valide'),
    ],
  }),
  // Conforme, documents SANS date d'expiration : ils restent valides.
  driver({
    id: 'drv-8',
    zc_number: 'ZC-217745',
    first_name: 'Yacoubou',
    last_name: 'BANI',
    phone: '+229 01 92 05 77 31',
    address: 'Quartier Albarika, Parakou',
    birth_date: '1979-03-08',
    driver_identifier: 'REG-PKU-0217',
    photo_url: null,
    status: 'actif',
    compliance: 'conforme',
    motorcycle: motorcycle('mot-6'),
    documents: [
      doc('doc-d8-i', 'piece_identite', 'driver', 'drv-8', null, 'valide'),
      doc('doc-d8-p', 'permis', 'driver', 'drv-8', null, 'valide'),
      doc('doc-d8-t', 'droit_taxi', 'driver', 'drv-8', null, 'valide'),
    ],
  }),
];

function qr(id: string, driverId: string, token: string, issuedAt: string, revokedAt: string | null = null): QrCode {
  return {
    id,
    driver_id: driverId,
    token,
    public_url: `https://${MOCK_DOMAIN}/v/${token}`,
    status: revokedAt ? 'revoque' : 'actif',
    issued_at: issuedAt,
    revoked_at: revokedAt,
  };
}

export const mockQrCodes: QrCode[] = [
  qr('qr-1', 'drv-1', 'demo-moussa', '2026-03-02T09:00:00Z'),
  qr('qr-2', 'drv-2', 'demo-ibrahim', '2026-03-05T09:00:00Z'),
  qr('qr-3', 'drv-3', 'demo-rachidi', '2026-03-11T09:00:00Z'),
  // QR encore actif d'un conducteur archivé : la page publique répond comme
  // pour un QR inconnu (aucun indice, aucune donnée personnelle).
  qr('qr-5', 'drv-5', 'demo-archive', '2026-03-21T09:00:00Z'),
  qr('qr-6', 'drv-6', 'demo-kassim', '2026-04-02T09:00:00Z'),
  qr('qr-7', 'drv-7', 'demo-sans-moto', '2026-04-10T09:00:00Z'),
  qr('qr-8', 'drv-8', 'demo-sans-date', '2026-04-12T09:00:00Z'),
  qr('qr-1-old', 'drv-1', 'demo-revoque', '2026-03-01T09:00:00Z', '2026-03-02T08:59:00Z'),
];

// Projection publique, champ par champ (jamais de spread : aucun champ privé
// ne doit passer). null pour un conducteur en attente ou archivé, que l'API
// publique traite comme introuvable.
export function toPublicProfile(item: Driver): PublicDriverProfile | null {
  if (item.status !== 'actif' && item.status !== 'suspendu') return null;
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

// Projection agent (AG3), champ par champ : documents en texte, sans URL de
// fichier. L'assurance vient de la moto ACTUELLE. `consulted_at` simule
// l'horodatage que l'API pose en enregistrant la consultation.
export function toControlView(item: Driver): DriverControl {
  const documents = [...item.documents, ...(item.motorcycle?.documents ?? [])].map((document) => ({
    type: document.type,
    number: document.number,
    issued_at: document.issued_at,
    expires_at: document.expires_at,
    validity: document.validity,
  }));
  return {
    zc_number: item.zc_number,
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
