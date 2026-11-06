# ZemiConnect — frontend V2

Registre des conducteurs de taxi-moto (zémidjans) de Parakou. Un passager scanne le QR d'un conducteur, ou saisit son numéro ZemiConnect, et voit sa photo, son nom, son numéro, son statut et sa moto. Prototype personnel, sans partenaire institutionnel.

Stack : Next.js 16 (App Router), TypeScript, Tailwind 4, React Query, React Hook Form + Zod, axios, Lucide.

> État actuel : **squelette**. Architecture, authentification, client API, coques et composants UI sont en place ; chaque page affiche son titre et « Écran à venir ».

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

## Structure

```
src/
  app/
    (public)/        PU1 accueil, PU2 /v/[token] et /recherche (composants serveur, no-store), mentions légales
    (auth)/          connexion, mot de passe oublié, réinitialisation, changement du mot de passe provisoire
    agent/           AG1 à AG5 — coque mobile, bouton « Scanner un QR »
    gestion/         GE1 et suivants — barre latérale 240 px
    administration/  AD1 et suivants — même coque, écrans de gestion en readOnly
    dev/ui/          catalogue des composants (développement uniquement)
  components/
    ui/              composants génériques (Button, champs, badges, DataTable, Modal…)
    layout/          coques et barres (AppLayout, AppSidebar, AgentTopBar, PublicHeader, ReadOnlyBanner…)
    auth/AuthGuard   garde client (confort)
    dev/             sélecteur de rôle fictif, catalogue UI
  features/<domaine> écrans partagés entre espaces (prop readOnly) ; dossiers vides + index ailleurs
  lib/
    api/http.ts      client axios central (Sanctum SPA)
    api/raw.ts       instances sans intercepteur : publicHttp (serveur, sans cookie), rawHttp (CSRF)
    api/errors.ts    toApiError + applyApiErrorsToForm (422 → champs RHF)
    api/mock.ts      helpers du mode fictif
    api/services/<domaine>/<nom>.ts   services par domaine
    query/           QueryClient + fabrique de clés
    toast/           store de toasts + toast automatique des mutations
    permissions.ts   can(me, permission)
    constants.ts     rôles, espaces, pages publiques
  hooks/queries/     hooks React Query par domaine (useMe, useDrivers, useDriver…)
  config/navigation.ts  menus par espace, filtrés par permission
  types/             Driver, Motorcycle, Document, QrCode, User, ApiResponse, Paginated…
  mocks/             données fictives
  proxy.ts           redirections selon le rôle (confort uniquement)
```

## Authentification (Sanctum, mode SPA)

- `http` est configuré en `withCredentials` + `withXSRFToken: true` : le front et l'API sont sur des origines différentes en local.
- `GET /sanctum/csrf-cookie` est appelé **une seule fois**, avant la première écriture (POST/PUT/PATCH/DELETE) ou la connexion. Sur une réponse 419, il est redemandé et la requête rejouée une fois.
- **401** : pas de rafraîchissement de jeton, redirection vers `/connexion`, sauf sur les pages publiques (`/`, `/v/…`, `/recherche`, `/mentions-legales`) et d'authentification.
- **403 / 422 / 429** : normalisés par `toApiError`. Les erreurs 422 sont reportées sur les champs avec `applyApiErrorsToForm(error, setError)`.
- `proxy.ts` et `AuthGuard` sont **du confort, pas de la sécurité**. Ils lisent l'indice de rôle `zc_role` (cookie non httpOnly posé après `/auth/me`) et `/auth/me` ; l'API reste seule juge (401/403).

## Mode fictif

- Avec `NEXT_PUBLIC_API_MOCK=true`, chaque service renvoie une réponse **de même forme** que l'API (`{ status, message, data }`, pagination Laravel), y compris les erreurs (404, 422) construites comme des erreurs axios. Pages et hooks ne voient pas la différence.
- Le mode fictif fonctionne aussi côté serveur (`/v/[token]`, `/recherche`).
- En développement, un sélecteur de rôle (barre supérieure) bascule entre administrateur, gestionnaire et agent. Sans choix, le rôle est administrateur.
- La session fictive (utilisateur connecté) est gardée dans le `localStorage` du navigateur ; la déconnexion l'efface.

### Comptes de démonstration

Mot de passe commun : `demo-zc-2026`.

| Email | Cas |
| --- | --- |
| `kofi.dossou@zemiconnect.exemple` | administrateur → `/administration` |
| `aicha.toko@zemiconnect.exemple` | gestionnaire → `/gestion` |
| `bachirou.sanni@zemiconnect.exemple` | agent → `/agent` |
| `florent.agbo@zemiconnect.exemple` | agent avec mot de passe provisoire → `/changer-mot-de-passe` |
| `sylvain.hounkpatin@zemiconnect.exemple` | compte désactivé |
| `bloque@zemiconnect.exemple` | blocage temporaire (429, 15 minutes) |

Tout autre email ou mot de passe donne « Email ou mot de passe incorrect ».

### Données publiques de démonstration

- QR : `/v/demo-moussa` (actif, avec photo et structure gestionnaire), `/v/demo-ibrahim` (actif, sans photo), `/v/demo-rachidi` (suspendu).
- QR non valide (404) : `/v/demo-revoque` (révoqué), `/v/demo-archive` (conducteur archivé, QR révoqué à l’archivage), tout autre jeton.
- Numéros : `ZC-482917`, `ZC-305611`, `ZC-771204` ; `ZC-000000` → « Numéro introuvable » ; `TROP` → 429 ; `HORS-LIGNE` → erreur réseau.
- Réinitialisation : `/reinitialisation?token=demo&email=aicha.toko@zemiconnect.exemple` ; `token=expire` → « Lien expiré ou déjà utilisé ».

### Données agent de démonstration (lot 2)

Connexion : `bachirou.sanni@zemiconnect.exemple`. Fiches `/agent/conducteur/<jeton>` :

| Jeton | Cas |
| --- | --- |
| `demo-moussa` | actif, conforme (permis sans date d'expiration) |
| `demo-ibrahim` | actif, expire bientôt (assurance de la moto dans 7 jours) |
| `demo-kassim` | actif, non conforme (droit de taxi manquant) |
| `demo-rachidi` | suspendu, non conforme |
| `demo-sans-moto` | actif, aucune moto affectée |
| `demo-sans-date` | actif, conforme, documents sans date d'expiration |
| `demo-revoque`, tout jeton inconnu | QR non valide |
| `demo-acces-refuse` | 403, accès refusé |
| `demo-desactive` | compte désactivé : déconnexion, puis message sur `/connexion` |
| `demo-session-expiree` | 401 : `/connexion`, puis retour sur la fiche |
| `demo-reseau` | réseau indisponible |

Recherche (`/agent/recherche?q=`) : numéro ou immatriculation, par exemple `ZC-559013` ou `BB 4521 RB` ; `ZC-000000` → aucun résultat ; `HORS-LIGNE` → réseau.

## Conventions reprises de HealthBook

- Racine `src/`, alias `@/*`, `tsconfig` strict et ESLint (`next/core-web-vitals` + `next/typescript`) identiques ; pas de Prettier (HealthBook n'en a pas).
- Client axios unique, gestion d'erreurs centralisée (`toApiError`), toast automatique sur chaque mutation via le `MutationCache` (`meta.toast`, `false` pour le désactiver).
- Services sous forme d'objets `xxxService = { list, get, … }` qui déballent l'enveloppe et renvoient `data`.
- Hooks `hooks/queries/useX.ts`, clés hiérarchiques `createCatalogKeys()`, aucune relance sur une erreur 4xx.
- DataTable générique : `Column<T> { key, title, render, align }`, `isLoading` (squelette), `pagination` serveur, `isHead` / `isSearch` / `isFilterTabs`, `onRowClick`.
- Champs `forwardRef` avec `label` / `error` / `helperText` / `required`, branchés sur `register()`.
- Menus déclarés comme données et filtrés ; coque `AppLayout` = barre latérale + barre supérieure ; garde client fondée sur `useMe`.

## Choix faits hors HealthBook

- **Formulaires** : React Hook Form + Zod (imposés). HealthBook déclare ces bibliothèques sans les utiliser.
- **Sanctum par cookie** au lieu des jetons Bearer de HealthBook.
- **Types** de domaine dans `src/types/` (demandé), plutôt que dispersés dans les services comme dans HealthBook.
- **Indice de rôle `zc_role`** : le cookie Sanctum est httpOnly et ne contient pas le rôle, donc `proxy.ts` a besoin d'un indice lisible.
- **Lecture seule de l'administration** : écrans de `features/` avec `readOnly`, pas d'écrans dupliqués. L'administrateur gère seulement les gestionnaires et les paramètres.
- **`features/agents/`** ajouté (comptes agents partagés gestion/administration), distinct de `features/agent/` (écrans de l'agent de contrôle).
- **Toasts** : store minimal par module (comme HealthBook), aucun store global.
- **Pas de devtools React Query** ni d'autre dépendance non utilisée. Dépendances ajoutées : axios, @tanstack/react-query, react-hook-form, zod, @hookform/resolvers, lucide-react, clsx.
- **Police** : Inter via `next/font/google` (demandé). Le DESIGN.md des maquettes cite Manrope/Public Sans.
- **Endpoints** supposés (`/auth/me`, `/drivers`, `/public/drivers/qr/{token}`, `/agent/drivers/search`…) : à aligner sur l'API quand elle existera, dans les seuls fichiers de `lib/api/services/`.
- Le numéro ZemiConnect n'a aucune validation de format. Les dates d'expiration absentes restent `null`.

## Lot 1 : espace public et authentification

- **Profil public** : `PublicDriverProfile` ne contient que photo, nom, numéro, statut (actif ou suspendu), moto (immatriculation, marque, couleur) et structure gestionnaire. Un conducteur en attente ou archivé donne la même réponse 404 qu'un QR inconnu ou révoqué.
- **Vrai 404** : `notFound()` dans `/v/[token]` et `/recherche`, sans `loading.tsx` au-dessus (une réponse streamée garderait le code 200). Écrans : `(public)/not-found.tsx` (QR non valide) et `(public)/recherche/not-found.tsx` (numéro introuvable).
- **PU1** : la recherche est faite par `/recherche` (serveur) ; le formulaire navigue dans une transition (bouton en chargement, champ verrouillé). Une erreur 429 ou réseau réaffiche PU1 avec le message.
- **Pages publiques légères** : React Query et les toasts (`AppProviders`) ne sont montés que dans les layouts connectés et `(auth)` ; liens publics sans préchargement ; Inter en `latin`, graisses 400 et 600 (`font-bold` ramené à 600).
- **`retour`** (`/connexion?retour=…`) : accepté seulement s'il s'agit d'un chemin interne de l'espace du rôle (`lib/auth/redirect.ts`), sinon ignoré.
- **Mot de passe provisoire** : indice `zc_mdp_provisoire` ; `proxy.ts` et `AuthGuard` ramènent vers AU4 (confort, l'API reste juge).
- **Règles du mot de passe** : un seul schéma Zod, `lib/validation/password.ts` (10 caractères, une lettre, un chiffre : proposition technique), réutilisé par AU3, AU4 et les futurs profils.
- **Contrat supposé de `/auth/login`** : 422 identifiants incorrects, 403 compte désactivé, 429 avec `Retry-After` en secondes. `remember` est envoyé pour « Rester connecté ».
- **Composants ajoutés** : `ui/Checkbox` et `ui/Alert` (messages en ligne des formulaires).
- **Captures** : `docs/captures/lot-1/` (360 px) et `docs/captures/lot-1/ordinateur/` (1440 px).

## Lot 2 : espace agent

- **Contexte** : téléphone d'entrée de gamme, dehors, en plein soleil. Textes agrandis, contrastes forts, cibles tactiles d'au moins 48 px (vérifiées à 360 px).
- **Scanner (AG2)** : `qr-scanner` (nimiq), chargé en import dynamique sur `/agent/scanner` seulement (Web Worker, BarcodeDetector quand il existe). Seuls les QR `NEXT_PUBLIC_PUBLIC_URL/v/<jeton>` sont acceptés (`lib/qr/parseQr.ts`) ; l'URL lue n'est jamais ouverte. Caméra libérée en quittant la page. `qr-scanner` masque la cause d'un échec : le refus de caméra est retrouvé par l'API des permissions et un appel direct.
- **Fiche (AG3)** : type `DriverControl` (`src/types/control.ts`), sans URL de fichier. Conformité et validités viennent de l'API ; le front construit seulement la phrase de synthèse (`features/agent/verdict.ts`) sur permis, droit de taxi et assurance de la moto actuelle. Pièce d'identité hors verdict, document sans date d'expiration non bloquant. Chaque ouverture est une nouvelle consultation (aucun cache).
- **États (AG4)** : un seul composant, `features/agent/AgentState.tsx`. Session perdue : `lib/auth/sessionFailure.ts`, appelé par l'intercepteur axios et par le cache React Query (ce qui couvre le mode fictif). 401 → `/connexion?motif=session&retour=…` ; 403 `{ code: 'account_disabled' }` (contrat supposé) → déconnexion et `/connexion?motif=desactive`.
- **Profil (AG5)** : `PUT /auth/profile` (supposé) pour nom, prénom et téléphone ; email en lecture seule ; carte `features/auth/PasswordCard.tsx`, réutilisable par les autres profils.
- **Dépendance ajoutée** : `qr-scanner` (demandée, légère, worker et BarcodeDetector).
- **Captures** : `docs/captures/lot-2/` (360 px).

## Lot 3 : espace gestion

### Partie A : conducteurs (GE1 à GE4)

- **Lecture seule** : les écrans de `features/` (tableau de bord, liste, fiche et ses onglets) prennent `readOnly`. Vrai : aucun bouton d'écriture n'est rendu (ni grisé, ni désactivé). Un dossier archivé est traité de la même façon. L'administration (lot 4) réutilise ces composants.
- **Pas de suppression** : on archive (motif, QR révoqué, affectation clôturée).
- **Confirmations** : `ConfirmDialog` (motif obligatoire pour suspendre, archiver, régénérer, révoquer). Sur une erreur, bandeau en haut de la modale, saisie conservée ; une 422 sur `reason` s'affiche sous le champ.
- **Statut et conformité séparés** : la conformité (permis, droit de taxi, assurance de la moto actuelle ; « expire bientôt » = 30 jours ; sans date d'expiration = valide) vient de l'API. En mode fictif, `mocks/compliance.ts` la calcule. Un document expiré ne suspend jamais.
- **Fichiers** : PDF, JPG ou PNG, 5 Mo (`lib/files.ts`, proposition technique) ; contrôle client de confort. « Voir le fichier » demande une URL temporaire à l'API (`GET /documents/{id}/file`) ; aucun chemin public permanent.
- **Numéro ZemiConnect** : attribué à la validation (« En attente » avant), sans validation de format.
- **GE2** : filtres dans l'URL (`?q=&statut=&conformite=&du=&au=&page=`) ; un choix crée une entrée d'historique, la frappe dans la recherche la remplace. Cartes sous 768 px.
- **GE3** : dossier créé En attente à la fin de l'étape Identité, reprise par `?reprendre=<id>&etape=0..4`. Recadrage carré par `react-easy-crop` (import dynamique) ; photo par caméra (getUserMedia) ou fichier.
- **QR et badge** : PDF, PNG et SVG produits par l'API (`/drivers/{id}/badge.pdf`, `/drivers/{id}/qr-codes/active.png|svg`) ; en mode fictif, fichiers d'exemple de `public/mocks/`.
- **Coque** : sous 768 px, la barre latérale s'ouvre par le bouton « Menu ».
- **Dépendance ajoutée** : `react-easy-crop` (demandée, recadrage de la photo).
- Endpoints supposés : en tête de chaque fichier de `lib/api/services/` (drivers, documents, motorcycles, qr, dashboard).

### Données de démonstration (gestion)

Connexion : `aicha.toko@zemiconnect.exemple`. Les modifications restent en mémoire jusqu'au rechargement de la page.

| Dossier | Cas |
| --- | --- |
| Moussa ALASSANE (`drv-1`) | actif, conforme ; historique de documents, d'affectations et de QR |
| Ibrahim SALIFOU (`drv-2`) | actif, expire bientôt (assurance dans 7 jours) |
| Rachidi BIO (`drv-3`) | suspendu, non conforme (permis manquant, documents expirés) |
| Saka GOUNOU (`drv-4`) | en attente, **incomplet** (ni photo, ni permis, ni moto) |
| Fousséni TANKO (`drv-9`) | en attente, complet : prêt à valider |
| Issa YAROU (`drv-5`) | archivé |
| Kassim ORÉ, Gildas KOUAGOU, Yacoubou BANI | actifs : droit de taxi manquant, sans moto, documents sans date d'expiration |

Déclencheurs du mode fictif :
- `?demo=vide` sur `/gestion` ou `/gestion/conducteurs` : premier lancement, registre vide.
- Moto `BB 1234 RB` : affichée libre mais refusée (« Cette moto est déjà affectée à un autre conducteur »), comme en cas de concurrence.
- Motif contenant `ERREUR-DEMO` : erreur serveur (bandeau dans la modale) ; `REFUS-DEMO` : erreur 422 sous le champ Motif.

Captures : `docs/captures/lot-3/` (1440 px) et `docs/captures/lot-3/768/`.
