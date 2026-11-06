// Onglets de la fiche conducteur (GE4). Module sans 'use client' : les pages
// serveur l'importent pour lire ?onglet= (une valeur exportée d'un module
// client n'est, côté serveur, qu'une référence opaque).
export const DRIVER_TABS = [
  { value: 'identite', label: 'Identité' },
  { value: 'moto', label: 'Moto' },
  { value: 'documents', label: 'Documents' },
  { value: 'qr', label: 'QR et badge' },
  { value: 'historique', label: 'Historique' },
] as const;

export type DriverTab = (typeof DRIVER_TABS)[number]['value'];

export function toDriverTab(value: string | undefined): DriverTab | undefined {
  return DRIVER_TABS.find((tab) => tab.value === value)?.value;
}
