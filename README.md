# ZemiConnect — frontend V2

Registre des conducteurs de taxi-moto (zémidjans) de Parakou. Un passager scanne le QR d'un conducteur, ou saisit son numéro ZemiConnect, et voit sa photo, son nom, son numéro, son statut et sa moto. Prototype personnel, sans partenaire institutionnel.

Stack : Next.js 16 (App Router), TypeScript, Tailwind 4, React Query, React Hook Form + Zod, axios, Lucide. Dépendances ajoutées en cours de route, chacune pour un écran : `qr-scanner` (scanner agent) et `react-easy-crop` (recadrage de la photo).

> État : **tous les écrans du frontend sont faits** (lots 1 à 4). L'API Laravel n'existe pas encore : le mode fictif la remplace, et [`docs/api-contract.md`](docs/api-contract.md) décrit les endpoints attendus.

## Lancement

```bash
npm install
cp .env.example .env.local   # puis NEXT_PUBLIC_API_MOCK=true tant que l'API n'existe pas
npm run dev                  # http://localhost:3000
npm run lint
npm run build
```

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL de l'API Laravel, sans `/api/v1` (ex. `http://localhost:8000`). |
| `NEXT_PUBLIC_API_MOCK` | `true` : les services renvoient les données de `src/mocks/` au lieu d'appeler l'API. |
| `NEXT_PUBLIC_PUBLIC_URL` | Origine des QR imprimés (`<origine>/v/<jeton>`). Le scanner agent refuse toute autre origine. |

## Écrans et routes

| Code | Écran | Route | Rôle |
| --- | --- | --- | --- |
| PU1 | Accueil et recherche | `/` | public |
| PU2 | Profil public (QR / numéro) | `/v/[token]`, `/recherche?numero=` | public |
| PU3 | QR non valide / Numéro introuvable (HTTP 404) | états de PU2 | public |
| — | Mentions légales (texte provisoire) | `/mentions-legales` | public |
| AU1 | Connexion | `/connexion?retour=&motif=` | public |
| AU2 | Mot de passe oublié | `/mot-de-passe-oublie` | public |
| AU3 | Réinitialisation | `/reinitialisation?token=&email=` | public |
| AU4 | Changement du mot de passe provisoire | `/changer-mot-de-passe` | connecté |
| AG1 | Accueil agent | `/agent` | agent |
| AG2 | Scanner QR | `/agent/scanner` | agent |
| AG3 | Fiche de consultation | `/agent/conducteur/[token]`, `/agent/recherche?q=` | agent |
| AG4 | États agent | dans AG3 | agent |
| AG5 | Mon profil | `/agent/profil` | agent |
| GE1 | Tableau de bord | `/gestion` | gestionnaire |
| GE2 | Conducteurs | `/gestion/conducteurs` | gestionnaire |
| GE3 | Nouveau conducteur (5 étapes) | `/gestion/conducteurs/nouveau?reprendre=&etape=` | gestionnaire |
| GE4 | Fiche conducteur | `/gestion/conducteurs/[id]?onglet=` | gestionnaire |
| GE5 | Motos | `/gestion/motos` | gestionnaire |
| GE6 | Fiche moto | `/gestion/motos/[id]` | gestionnaire |
| GE7 | Agents | `/gestion/agents` | gestionnaire |
| GE8 | Journaux | `/gestion/journaux` | gestionnaire |
| GE9 | Mon profil | `/gestion/profil` | gestionnaire |
| AD1 | Tableau de bord (consultation) | `/administration` | administrateur |
| AD2 | Gestionnaires | `/administration/gestionnaires` | administrateur |
| AD3 | Consultation en lecture seule | `/administration/conducteurs[/id]`, `/administration/motos[/id]`, `/administration/agents` | administrateur |
| AD4 | Journaux (avec Connexions) | `/administration/journaux` | administrateur |
| AD5 | Paramètres | `/administration/parametres` | administrateur |
| AD6 | Mon profil | `/administration/profil` | administrateur |
| — | Catalogue des composants (développement) | `/dev/ui` | — |

`/administration/conducteurs/nouveau` n'existe pas (404) : l'administrateur ne fait aucune opération métier.

## Structure

```
src/
  app/               routes (groupes (public) et (auth), espaces agent, gestion, administration, dev/ui)
  features/<domaine> écrans, partagés entre espaces par la prop readOnly (jamais d'écran dupliqué)
    public/ auth/ agent/ dashboard/ drivers/ motorcycles/ agents/ managers/ logs/ settings/ profile/
  components/ui/     composants génériques (Button, champs, badges, DataTable, Modal, Drawer, ConfirmDialog, Stepper…)
  components/layout/ coques et barres (AppLayout, AgentTopBar, PublicHeader, ReadOnlyBanner…)
  lib/api/           client axios (Sanctum), erreurs, mode fictif, services par domaine
  lib/auth/          indices de session, redirection sûre, session perdue
  lib/               permissions, constantes, fichiers acceptés, schéma du mot de passe, libellés, formats
  hooks/queries/     hooks React Query par domaine
  types/             types de domaine
  mocks/             données et magasins fictifs (conformité calculée, journal, comptes…)
  proxy.ts           redirections selon le rôle (confort uniquement)
```

## Authentification et droits

- **Sanctum (SPA)** : `withCredentials` + `withXSRFToken`. `/sanctum/csrf-cookie` est appelé une fois, avant la première écriture ou la connexion ; sur un 419, il est redemandé et la requête rejouée une fois.
- **Session perdue** (`lib/auth/sessionFailure.ts`) : 401 → `/connexion?motif=session&retour=<page>` ; 403 `{ code: 'account_disabled' }` → déconnexion et `/connexion?motif=desactive`. Jamais sur une page publique.
- `retour` n'est suivi que s'il désigne un chemin interne de l'espace du rôle.
- `proxy.ts` et `AuthGuard` sont **du confort, pas de la sécurité** : l'API reste seule juge (401, 403).
- **Administrateur** : gère les gestionnaires et les paramètres, consulte tout le reste en lecture seule (`readOnly` + `ReadOnlyBanner`). Aucun bouton d'écriture rendu ; « Voir le fichier » et les téléchargements (QR, badge) restent disponibles.

## Règles métier tenues par le front

- Statut (En attente, Actif, Suspendu, Archivé) et conformité (Conforme, Expire bientôt, Non conforme) sont **distincts** : un document expiré ne suspend jamais.
- Conformité : permis, droit de taxi, assurance de la moto actuelle ; « expire bientôt » = 30 jours ; un document sans date d'expiration est valide. Calculée par l'API (en mode fictif : `mocks/compliance.ts`).
- Numéro ZemiConnect attribué à la validation (« En attente » avant), sans validation de format. Recherche exacte, normalisée (espaces retirés, majuscules).
- Pas de suppression : on archive ou on désactive. Toute action sensible passe par `ConfirmDialog` (motif obligatoire quand c'est demandé ; erreur en bandeau, saisie conservée, 422 sous le champ).
- Fichiers : PDF, JPG ou PNG, 5 Mo (`lib/files.ts`, contrôle de confort). Les fichiers s'ouvrent par une URL temporaire fournie par l'API.
- Mot de passe : 10 caractères, une lettre, un chiffre (`lib/validation/password.ts`, un seul schéma).
- Jamais les mots « autorisé » ou « non autorisé ».

## Mode fictif

`NEXT_PUBLIC_API_MOCK=true` : chaque service renvoie la même forme que l'API (`{ status, message, data }`, pagination Laravel, erreurs axios). Les données restent **en mémoire** jusqu'au rechargement de la page (paramètres AD5 : cookie, pour être lus aussi par le profil public rendu côté serveur). Les dates sont relatives au jour courant. Toute écriture métier faite avec le rôle admin répond **403**, comme l'API.

### Comptes de démonstration

Mot de passe commun : `demo-zc-2026`.

| Email | Cas |
| --- | --- |
| `kofi.dossou@zemiconnect.exemple` | administrateur |
| `aicha.toko@zemiconnect.exemple` | gestionnaire |
| `sylvain.hounkpatin@zemiconnect.exemple` | gestionnaire désactivé (connexion refusée) |
| `bachirou.sanni@zemiconnect.exemple` | agent (AG-0142) |
| `florent.agbo@zemiconnect.exemple` | agent, mot de passe provisoire → AU4 |
| `chantal.seidou@zemiconnect.exemple` | agent désactivé |
| `ousmane.adam@zemiconnect.exemple` | agent archivé |
| `bloque@zemiconnect.exemple` | blocage temporaire (429, 15 minutes) |

### Conducteurs et motos

| Dossier | Jeton QR | Cas |
| --- | --- | --- |
| Moussa ALASSANE `ZC-482917` | `demo-moussa` | actif, conforme (permis sans date d'expiration), photo, historiques |
| Ibrahim SALIFOU `ZC-305611` | `demo-ibrahim` | actif, expire bientôt (assurance dans 7 jours) |
| Rachidi BIO `ZC-771204` | `demo-rachidi` | suspendu, non conforme |
| Kassim ORÉ `ZC-559013` | `demo-kassim` | actif, droit de taxi manquant |
| Gildas KOUAGOU `ZC-840266` | `demo-sans-moto` | actif, sans moto |
| Yacoubou BANI `ZC-217745` | `demo-sans-date` | actif, documents sans date d'expiration |
| Saka GOUNOU | — | en attente, incomplet |
| Fousséni TANKO | — | en attente, complet (prêt à valider) |
| Issa YAROU `ZC-664430` | `demo-archive` (révoqué) | archivé |

Motos sans conducteur : `BB 9042 RB`, `BB 7710 RB`.

### Déclencheurs

| Où | Déclencheur | Effet |
| --- | --- | --- |
| PU1 / `/recherche` | numéro `TROP` / `HORS-LIGNE` | 429 / erreur réseau |
| PU2 | `/v/demo-revoque`, `/v/demo-archive`, jeton inconnu | QR non valide (404) |
| AU3 | `token=expire` | lien expiré ou déjà utilisé |
| AG3 | jetons `demo-session-expiree`, `demo-desactive`, `demo-acces-refuse`, `demo-reseau` | 401, compte désactivé, 403, réseau |
| AG3 | recherche `HORS-LIGNE` ; `ZC-000000` | réseau ; aucun résultat |
| GE1 / GE2 | `?demo=vide` | premier lancement (registre vide) |
| GE3 / GE4 | moto `BB 1234 RB` | « Cette moto est déjà affectée à un autre conducteur » |
| Confirmations | motif contenant `ERREUR-DEMO` / `REFUS-DEMO` | bandeau d'erreur / 422 sous le motif |
| Toute écriture métier | rôle admin (`zc_role=admin`) | 403 |

## Conventions

Reprises de HealthBook : racine `src/`, alias `@/*`, ESLint `next/core-web-vitals` + `next/typescript`, client axios unique et `toApiError`, toast automatique des mutations (`meta.toast`), services `xxxService` qui déballent l'enveloppe, hooks `hooks/queries/useX`, clés `createCatalogKeys()`, DataTable déclaratif, champs `forwardRef` branchés sur `register()`, menus déclarés comme données.

Hors HealthBook : React Hook Form + Zod, Sanctum par cookie, types dans `src/types/`, indices de rôle `zc_role` et `zc_mdp_provisoire` (lisibles par `proxy.ts`), écrans partagés par `readOnly`.

## Tests et captures

Chaque lot a été vérifié dans un navigateur (Chrome, Playwright, build de production, mode fictif). Captures : `docs/captures/lot-1` (360 px et ordinateur), `lot-2` (360 px), `lot-3` et `lot-4` (1440 px et 768 px).

Point connu : le profil public PU2 pèse environ 235 Ko au premier chargement (police Inter et React compris), au-dessus de l'objectif de 200 Ko.
