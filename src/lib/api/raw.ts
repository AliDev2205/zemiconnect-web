import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// Instance sans intercepteurs et SANS cookie, pour les lectures publiques
// (profil /v/[token], recherche par numéro). Utilisable côté serveur (composant
// serveur) comme côté navigateur : aucun accès à window ni à document.
export const publicHttp = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15000,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
  },
});

// Instance sans intercepteurs, utilisée uniquement pour GET /sanctum/csrf-cookie
// depuis lib/api/http.ts : évite toute récursion avec les intercepteurs de `http`.
export const rawHttp = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
});
