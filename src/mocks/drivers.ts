import type { Document } from '@/types/document';
import type { Driver, PublicDriverProfile } from '@/types/driver';
import type { Motorcycle } from '@/types/motorcycle';
import type { QrCode } from '@/types/qr';
import { MOCK_DOMAIN } from './users';

// Données fictives. Les dates d'expiration à null sont volontaires : un
// document peut ne pas expirer, on n'en invente jamais.

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
    number: validity === 'manquant' ? null : `${type.toUpperCase().slice(0, 3)}-${id.slice(-4)}`,
    issued_at: validity === 'manquant' ? null : '2024-03-15',
    expires_at: expiresAt,
    validity,
    file_url: null,
    created_at: '2026-03-01T09:00:00Z',
  };
}

export const mockMotorcycles: Motorcycle[] = [
  {
    id: 'mot-1',
    plate_number: 'BB 4521 RB',
    brand: 'Bajaj',
    model: 'Boxer BM 150',
    color: 'Rouge',
    driver_id: 'drv-1',
    driver_name: 'Moussa ALASSANE',
    documents: [doc('doc-m1-a', 'assurance', 'motorcycle', 'mot-1', '2027-01-15', 'valide')],
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'mot-2',
    plate_number: 'BB 7310 RB',
    brand: 'Haojue',
    model: 'HJ 125',
    color: 'Noir',
    driver_id: 'drv-2',
    driver_name: 'Ibrahim SALIFOU',
    documents: [doc('doc-m2-a', 'assurance', 'motorcycle', 'mot-2', '2026-11-28', 'expire_bientot')],
    created_at: '2026-03-04T09:00:00Z',
  },
  {
    id: 'mot-3',
    plate_number: 'BB 1188 RB',
    brand: 'TVS',
    model: 'Star HLX',
    color: 'Bleu',
    driver_id: 'drv-3',
    driver_name: 'Rachidi BIO',
    documents: [doc('doc-m3-a', 'assurance', 'motorcycle', 'mot-3', '2026-08-31', 'expire')],
    created_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'mot-4',
    plate_number: 'BB 9042 RB',
    brand: 'Bajaj',
    model: 'Boxer BM 100',
    color: 'Rouge',
    driver_id: null,
    driver_name: null,
    documents: [doc('doc-m4-a', 'assurance', 'motorcycle', 'mot-4', null, 'manquant')],
    created_at: '2026-04-02T09:00:00Z',
  },
];

const motorcycle = (id: string) => mockMotorcycles.find((item) => item.id === id) ?? null;

export const mockDrivers: Driver[] = [
  {
    id: 'drv-1',
    zc_number: 'ZC-482917',
    first_name: 'Moussa',
    last_name: 'ALASSANE',
    phone: '+229 01 96 12 34 56',
    photo_url: null,
    status: 'actif',
    compliance: 'conforme',
    motorcycle: motorcycle('mot-1'),
    documents: [
      doc('doc-d1-i', 'piece_identite', 'driver', 'drv-1', '2031-05-20', 'valide'),
      doc('doc-d1-p', 'permis', 'driver', 'drv-1', null, 'valide'),
      doc('doc-d1-t', 'droit_taxi', 'driver', 'drv-1', '2027-03-31', 'valide'),
    ],
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-10-12T09:00:00Z',
  },
  {
    id: 'drv-2',
    zc_number: 'ZC-305611',
    first_name: 'Ibrahim',
    last_name: 'SALIFOU',
    phone: '+229 01 95 22 11 08',
    photo_url: null,
    status: 'actif',
    compliance: 'expire_bientot',
    motorcycle: motorcycle('mot-2'),
    documents: [
      doc('doc-d2-i', 'piece_identite', 'driver', 'drv-2', '2029-01-10', 'valide'),
      doc('doc-d2-p', 'permis', 'driver', 'drv-2', null, 'valide'),
      doc('doc-d2-t', 'droit_taxi', 'driver', 'drv-2', '2026-11-20', 'expire_bientot'),
    ],
    created_at: '2026-03-04T09:00:00Z',
    updated_at: '2026-10-01T09:00:00Z',
  },
  {
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
    created_at: '2026-03-10T09:00:00Z',
    updated_at: '2026-09-15T09:00:00Z',
  },
  {
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
    created_at: '2026-10-28T09:00:00Z',
    updated_at: '2026-10-28T09:00:00Z',
  },
  {
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
    created_at: '2026-03-20T09:00:00Z',
    updated_at: '2026-07-01T09:00:00Z',
  },
];

export const mockQrCodes: QrCode[] = [
  {
    id: 'qr-1',
    driver_id: 'drv-1',
    token: 'demo-moussa',
    public_url: `https://${MOCK_DOMAIN}/v/demo-moussa`,
    status: 'actif',
    issued_at: '2026-03-02T09:00:00Z',
    revoked_at: null,
  },
  {
    id: 'qr-2',
    driver_id: 'drv-2',
    token: 'demo-ibrahim',
    public_url: `https://${MOCK_DOMAIN}/v/demo-ibrahim`,
    status: 'actif',
    issued_at: '2026-03-05T09:00:00Z',
    revoked_at: null,
  },
  {
    id: 'qr-3',
    driver_id: 'drv-3',
    token: 'demo-rachidi',
    public_url: `https://${MOCK_DOMAIN}/v/demo-rachidi`,
    status: 'actif',
    issued_at: '2026-03-11T09:00:00Z',
    revoked_at: null,
  },
  {
    id: 'qr-1-old',
    driver_id: 'drv-1',
    token: 'demo-revoque',
    public_url: `https://${MOCK_DOMAIN}/v/demo-revoque`,
    status: 'revoque',
    issued_at: '2026-03-01T09:00:00Z',
    revoked_at: '2026-03-02T08:59:00Z',
  },
];

export function toPublicProfile(driver: Driver): PublicDriverProfile {
  return {
    zc_number: driver.zc_number,
    first_name: driver.first_name,
    last_name: driver.last_name,
    photo_url: driver.photo_url,
    status: driver.status,
    compliance: driver.compliance,
    motorcycle: driver.motorcycle
      ? {
          plate_number: driver.motorcycle.plate_number,
          brand: driver.motorcycle.brand,
          model: driver.motorcycle.model,
          color: driver.motorcycle.color,
        }
      : null,
  };
}

// Résolution d'un jeton QR actif vers son conducteur (null si inconnu ou révoqué).
export function findDriverByActiveToken(token: string): Driver | null {
  const qr = mockQrCodes.find((item) => item.token === token && item.status === 'actif');
  return qr ? (mockDrivers.find((driver) => driver.id === qr.driver_id) ?? null) : null;
}

// Comparaison sans casse ni espaces : le format du numéro n'est pas arrêté.
export function normalizeLookup(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}
