import type { AppSettings } from '@/types/dashboard';

/*
 * Paramètres fictifs (AD5). Ils sont modifiés dans le navigateur mais lus aussi
 * par le profil public, rendu côté SERVEUR : en mode fictif, ils transitent
 * donc par un cookie lisible des deux côtés. En réel, ils sont en base.
 */
export const MOCK_SETTINGS_COOKIE = 'zc_mock_parametres';

export const DEFAULT_MOCK_SETTINGS: AppSettings = {
  structure_name: 'Coopérative des zémidjans de Parakou-Centre (fictive)',
  structure_contact: '+229 01 90 00 00 00',
  expiry_warning_days: 30,
};

export function parseMockSettings(raw: string | undefined): AppSettings {
  if (!raw) return DEFAULT_MOCK_SETTINGS;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Partial<AppSettings>;
    return { ...DEFAULT_MOCK_SETTINGS, structure_name: value.structure_name ?? null, structure_contact: value.structure_contact ?? null };
  } catch {
    return DEFAULT_MOCK_SETTINGS;
  }
}

export function readMockSettings(): AppSettings {
  if (typeof document === 'undefined') return DEFAULT_MOCK_SETTINGS;
  const raw = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${MOCK_SETTINGS_COOKIE}=`))
    ?.slice(MOCK_SETTINGS_COOKIE.length + 1);
  return parseMockSettings(raw);
}

export function writeMockSettings(settings: AppSettings): void {
  const value = encodeURIComponent(JSON.stringify({ structure_name: settings.structure_name, structure_contact: settings.structure_contact }));
  document.cookie = `${MOCK_SETTINGS_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}
