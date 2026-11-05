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
- Jetons QR de démonstration : `/v/demo-moussa` (Moussa ALASSANE, ZC-482917, BB 4521 RB), `/v/demo-ibrahim`, `/v/demo-rachidi` ; `/v/demo-revoque` donne « QR non valide ».

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
- **Endpoints** supposés (`/auth/me`, `/drivers`, `/public/drivers/qr/{token}`, `/controls/search`…) : à aligner sur l'API quand elle existera, dans les seuls fichiers de `lib/api/services/`.
- Le numéro ZemiConnect n'a aucune validation de format. Les dates d'expiration absentes restent `null`.
