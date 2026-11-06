import { COMPLIANCE_LABELS, DRIVER_STATUS_LABELS } from '@/lib/utils/labels';
import { formatDate } from '@/lib/utils/format';
import type { ControlDocument, DriverControl } from '@/types/control';
import type { DocumentType, DocumentValidity } from '@/types/document';

// Documents pris en compte pour la conformité. La pièce d'identité n'en fait
// PAS partie (elle est affichée, mais n'entre pas dans le verdict).
export const COMPLIANCE_DOCUMENTS = ['permis', 'droit_taxi', 'assurance'] as const;

// Ordre d'affichage des lignes de la fiche.
export const DOCUMENT_ORDER: DocumentType[] = ['permis', 'droit_taxi', 'assurance', 'piece_identite'];

// Libellés dans une phrase, avec leur genre pour l'accord (« expiré » / « expirée »).
const IN_SENTENCE: Record<(typeof COMPLIANCE_DOCUMENTS)[number], { label: string; feminine: boolean }> = {
  permis: { label: 'permis de conduire', feminine: false },
  droit_taxi: { label: 'droit de taxi', feminine: false },
  assurance: { label: 'assurance de la moto', feminine: true },
};

// Ligne d'un type de document : celui renvoyé par l'API, sinon « Manquant ».
export function documentLine(control: DriverControl, type: DocumentType): ControlDocument {
  return (
    control.documents.find((document) => document.type === type) ?? {
      type,
      number: null,
      issued_at: null,
      expires_at: null,
      validity: 'manquant',
    }
  );
}

function describe(document: ControlDocument, hasMotorcycle: boolean): string | null {
  const { label, feminine } = IN_SENTENCE[document.type as keyof typeof IN_SENTENCE];
  const e = feminine ? 'e' : '';
  const validity: DocumentValidity = document.validity;
  if (document.type === 'assurance' && !hasMotorcycle) return 'aucune moto affectée';
  switch (validity) {
    case 'manquant':
      return `${label} manquant${e}`;
    case 'expire':
      // Pas de date connue : on n'en invente pas.
      return document.expires_at ? `${label} expiré${e} depuis le ${formatDate(document.expires_at)}` : `${label} expiré${e}`;
    case 'expire_bientot':
      return document.expires_at ? `${label} jusqu'au ${formatDate(document.expires_at)}` : `${label} bientôt expiré${e}`;
    default:
      // Valide, avec ou sans date d'expiration : rien à signaler.
      return null;
  }
}

/*
 * Phrase de synthèse du bloc verdict, à partir des documents renvoyés par l'API :
 *   « Actif · Expire bientôt : assurance de la moto jusqu'au 12/11/2026 »
 *   « Actif · Non conforme : droit de taxi manquant »
 * La conformité elle-même (et le seuil des 30 jours) vient de l'API : le front
 * ne la recalcule pas, il nomme seulement les documents en cause.
 */
export function buildVerdictSentence(control: DriverControl): string {
  const head = `${DRIVER_STATUS_LABELS[control.status]} · ${COMPLIANCE_LABELS[control.compliance]}`;
  const hasMotorcycle = control.motorcycle !== null;

  if (control.compliance === 'conforme') return `${head} : permis, droit de taxi et assurance en règle`;

  // Non conforme : documents manquants ou expirés ; expire bientôt : échéances proches.
  const wanted: DocumentValidity[] = control.compliance === 'non_conforme' ? ['manquant', 'expire'] : ['expire_bientot'];
  const details = COMPLIANCE_DOCUMENTS.map((type) => documentLine(control, type))
    .filter((document) => wanted.includes(document.validity) || (document.type === 'assurance' && !hasMotorcycle))
    .map((document) => describe(document, hasMotorcycle))
    .filter((detail): detail is string => detail !== null);

  return details.length > 0 ? `${head} : ${details.join(', ')}` : head;
}
