// Origine officielle des QR ZemiConnect (ex. https://zemiconnect.bj). Les QR
// imprimés sur les badges pointent vers <origine>/v/<jeton>.
export const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_URL ?? 'http://localhost:3000';

const TOKEN_PATH = /^\/v\/([A-Za-z0-9_-]+)\/?$/;

/*
 * AG2 : extrait le jeton d'un QR lu par la caméra. N'accepte QUE l'origine
 * exacte de NEXT_PUBLIC_PUBLIC_URL (schéma, hôte et port) suivie de /v/<jeton>,
 * sans paramètre ni ancre. Tout le reste (autre site, autre chemin, texte
 * libre) renvoie null. L'URL lue n'est jamais ouverte : seul le jeton sert,
 * pour aller vers /agent/conducteur/<jeton>.
 */
export function parseZemiConnectQr(raw: string, publicUrl: string = PUBLIC_URL): string | null {
  let url: URL;
  let expected: URL;
  try {
    url = new URL(raw.trim());
    expected = new URL(publicUrl);
  } catch {
    return null;
  }
  if (url.origin !== expected.origin || url.search || url.hash || url.username || url.password) return null;
  return TOKEN_PATH.exec(url.pathname)?.[1] ?? null;
}
