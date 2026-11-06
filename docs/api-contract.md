# Contrat d'API attendu par le frontend ZemiConnect

Cahier pour le backend Laravel. Il décrit **ce que le frontend appelle aujourd'hui** (services de `src/lib/api/services/`) ; le mode fictif (`src/mocks/`) en simule le comportement. Un écart entre l'API et ce document se corrige dans les seuls fichiers de services.

## Conventions générales

- **Base** : `${NEXT_PUBLIC_API_URL}/api/v1` (ex. `http://localhost:8000/api/v1`).
- **Authentification** : Sanctum en mode SPA, par cookie de session (`withCredentials`). Le front appelle `GET /sanctum/csrf-cookie` (hors `/api/v1`) une fois avant la première écriture ou la connexion, puis renvoie `X-XSRF-TOKEN`. Sur un **419**, il redemande le cookie et rejoue la requête une fois.
- **Enveloppe de réponse** (toutes les routes JSON) :

  ```json
  { "status": "success", "message": "OK", "data": { } }
  ```

- **Pagination** (`data` des listes) :

  ```json
  { "data": [ ], "total": 42, "per_page": 15, "current_page": 1, "last_page": 3 }
  ```

  Paramètres : `page`, `per_page`.
- **Erreurs** :

  ```json
  { "status": "error", "message": "…", "errors": { "champ": ["message"] }, "code": "…" }
  ```

  | Code HTTP | Usage | Traitement côté front |
  | --- | --- | --- |
  | 401 | Session absente ou expirée | Retour à `/connexion?motif=session&retour=<page>` (jamais depuis une page publique) |
  | 403 | Droit insuffisant | État « Accès refusé » ou bandeau ; avec `code: "account_disabled"` : déconnexion, `/connexion?motif=desactive` |
  | 404 | Ressource introuvable | État vide ou PU3 |
  | 409 | Transition impossible (dossier archivé, statut incompatible…) | Bandeau dans la modale |
  | 419 | Jeton CSRF expiré | Nouveau cookie, requête rejouée une fois |
  | 422 | Validation (`errors` par champ) | Message sous chaque champ |
  | 429 | Trop d'essais, en-tête `Retry-After` (secondes) | « Réessayez dans X minutes » |

- **Dates** : `AAAA-MM-JJ` pour les dates seules (`birth_date`, `issued_at`, `expires_at`), ISO 8601 pour les horodatages. Une date d'expiration absente vaut `null` et ne doit jamais être inventée.
- **Permissions** : renvoyées par `GET /auth/me` ; l'API reste seule juge et répond 403.

| Permission | Rôles |
| --- | --- |
| `dashboard.view` | administrateur, gestionnaire |
| `drivers.view`, `motorcycles.view`, `agents.view`, `logs.view` | administrateur, gestionnaire |
| `drivers.manage`, `motorcycles.manage`, `documents.manage`, `qr.manage`, `agents.manage` | gestionnaire **seulement** |
| `managers.view`, `managers.manage`, `settings.manage` | administrateur |
| `agent.drivers.view` | agent |

L'administrateur **ne fait aucune opération métier** : toute écriture sur un conducteur, une moto, un document, un QR ou un agent doit lui répondre **403**.

## Règles métier attendues de l'API

- **Statut** du conducteur : `en_attente`, `actif`, `suspendu`, `archive`. **Conformité** : `conforme`, `expire_bientot`, `non_conforme`. Les deux sont indépendants : un document expiré ne change jamais le statut.
- **Conformité calculée par l'API** sur trois documents : le permis, le droit de taxi et l'assurance de la **moto actuelle**. Un document manquant ou expiré donne `non_conforme`. Une expiration dans les **30 jours** donne `expire_bientot`. Un document sans date d'expiration est valide. La pièce d'identité n'entre pas dans la conformité.
- **Validité d'un document** : `valide`, `expire_bientot`, `expire`, `manquant`.
- **Numéro ZemiConnect** : attribué à la validation seulement (`null` avant), sans format imposé.
- **Recherche par numéro ou immatriculation** : exacte, après normalisation (espaces retirés, majuscules).
- **Aucune suppression** : archivage ou désactivation.
- **Fichiers** : PDF, JPG ou PNG, 5 Mo au plus (proposition, contrôle aussi côté client). Ils ne sont jamais exposés par un chemin public permanent : URL temporaire.

## Types principaux

```ts
User { id, first_name, last_name, email, phone|null, role: 'admin'|'gestionnaire'|'agent',
       account_status: 'actif'|'desactive'|'archive', must_change_password: boolean,
       last_login_at|null, created_at, matricule?|null, structure?|null }      // matricule/structure : agents
Me { user: User, permissions: string[] }

Driver { id, zc_number|null, first_name, last_name, phone|null, address|null, birth_date|null,
         driver_identifier|null, photo_url|null, has_paper_form: boolean, status, compliance,
         motorcycle: Motorcycle|null, assignment_started_at|null, documents: Document[],   // documents actuels
         validated_at|null, archived_at|null, created_at, updated_at }

Motorcycle { id, plate_number, brand|null, model|null, color|null, year|null, chassis_number|null,
             driver_id|null, driver_name|null, documents: Document[], archived_at|null, created_at }

Document { id, type: 'piece_identite'|'permis'|'droit_taxi'|'assurance', owner_type: 'driver'|'motorcycle',
           owner_id, number|null, issued_at|null, expires_at|null, validity, has_file: boolean,
           superseded_at|null, created_at }

Assignment { id, driver_id, driver_name, motorcycle_id, plate_number, started_at, ended_at|null, reason|null }

QrCode { id, driver_id, token, public_url, status: 'actif'|'revoque', issued_at, revoked_at|null, revoke_reason|null }

LogEntry { id, kind: 'audit'|'consultation'|'connexion', action, actor_name|null, actor_role|null,
           resource_type|null, resource_id|null, resource_label|null, driver_id|null, detail|null,
           old_values|null, new_values|null, reason|null, ip_address|null, created_at,
           login_email?|null, login_result?: 'reussie'|'echouee'|'bloquee', user_agent?|null }

PublicDriverProfile { zc_number, first_name, last_name, photo_url|null, status: 'actif'|'suspendu',
                      motorcycle: { plate_number, brand|null, color|null }|null,
                      managing_structure: { name, contact|null }|null }   // aucun autre champ

AgentDriverView { zc_number, first_name, last_name, photo_url|null, phone|null, address|null, birth_date|null,
                  driver_identifier|null, status, compliance, motorcycle: {plate_number, brand, model, color, year,
                  chassis_number}|null, documents: [{type, number, issued_at, expires_at, validity}],   // sans fichier
                  consulted_at }
```

Codes d'action du journal (`LogEntry.action`) :
- conducteurs : `driver.created|updated|photo_updated|validated|suspended|reactivated|archived` ;
- documents, affectations, QR : `document.added|renewed`, `assignment.changed`, `qr.generated|regenerated|revoked` ;
- motos : `motorcycle.created|updated|archived` ;
- agents : `agent.created|updated|deactivated|reactivated|archived|reset_link_sent` ;
- gestionnaires et paramètres : `manager.created|updated|deactivated|reactivated|archived|reset_link_sent`, `settings.updated` ;
- consultations et connexions : `consultation.qr|search`, `auth.login`.

## Endpoints

### Authentification et profil (`services/auth`)

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/sanctum/csrf-cookie` (hors `/api/v1`) | — | — | cookie `XSRF-TOKEN` | — |
| POST | `/auth/login` | public | `{ email, password, remember }` | `Me` | 422 identifiants incorrects (message unique, sans dire quel champ est faux) ; 403 compte désactivé ; 429 + `Retry-After`. Chaque tentative est inscrite au journal des connexions (`kind: connexion`, `login_result`). |
| POST | `/auth/logout` | connecté | — | `null` | — |
| GET | `/auth/me` | connecté | — | `Me` | 401 ; 403 `account_disabled` |
| POST | `/auth/forgot-password` | public | `{ email }` | `null`, **même réponse** que l'email existe ou non | 429 |
| POST | `/auth/reset-password` | public | `{ token, email, password, password_confirmation }` | `null` | 422 sur `token`/`email` = lien expiré ou déjà utilisé ; 422 sur `password` |
| PUT | `/auth/password` | connecté | `{ current_password, password, password_confirmation }` | `null` ; met `must_change_password` à `false` | 422 `current_password` incorrect |
| PUT | `/auth/profile` | connecté | `{ first_name, last_name, phone|null }` (l'email n'est pas modifiable) | `Me` | 422 |

Règles du mot de passe proposées : 10 caractères au moins, une lettre, un chiffre. Tant que `must_change_password` vaut `true`, l'API refuse tout sauf `/auth/password`, `/auth/me` et `/auth/logout`.

### Public (`services/public`) — sans cookie, appelé côté serveur

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/public/drivers/qr/{token}` | public | — | `PublicDriverProfile` | **404** pour un jeton inconnu, un QR révoqué, un conducteur en attente ou archivé (même réponse, aucun indice) ; 429 |
| GET | `/public/drivers?numero=` | public | — | `PublicDriverProfile` | 404 ; 429 |

Limitation de débit : les appels viennent du serveur Next ; elle doit porter sur l'IP du client transmise (`X-Forwarded-For`), sinon tous les passagers partagent le même quota. `managing_structure` vient des paramètres (AD5) et vaut `null` s'ils sont vides.

### Consultation agent (`services/agent/drivers`)

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/agent/drivers/qr/{token}` | `agent.drivers.view` | — | `AgentDriverView` | 404 QR révoqué ou inconnu ; 403 ; 401 ; 403 `account_disabled` |
| GET | `/agent/drivers/search?q=` | `agent.drivers.view` | — | `AgentDriverView` | 404 aucune correspondance exacte (numéro ou immatriculation) |

Chaque appel **enregistre la consultation** (`consultation.qr` ou `consultation.search`, conducteur, agent, IP) et renvoie son horodatage dans `consulted_at`. Le préfixe `controls` est réservé aux contrôles enregistrés de la V2.

### Tableau de bord (`services/dashboard`)

| Méthode | URL | Permission | Réponse |
| --- | --- | --- | --- |
| GET | `/dashboard` | `dashboard.view` | `{ drivers_total, drivers_by_status{4 statuts}, active_by_compliance{3}, motorcycles_total, motorcycles_unassigned, agents_active, managers_active, todo: { expired: TodoItem[], expiring: TodoItem[], pending: TodoItem[] } }` |

`TodoItem { driver_id, driver_name, document_type|null, date|null, missing?: ('photo'|'piece_identite'|'permis'|'moto')[] }`. Les 10 dernières actions viennent de `GET /logs?kind=audit&per_page=10`.

### Conducteurs (`services/drivers`)

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/drivers?search&status&compliance&registered_from&registered_to&page&per_page` | `drivers.view` | — | `Paginated<Driver>` | — |
| GET | `/drivers/duplicates?phone&driver_identifier&first_name&last_name&exclude` | `drivers.manage` | — | `[{ id, name, zc_number|null, status, reasons: ('phone'|'identifier'|'name')[] }]` (avertissement non bloquant) | — |
| POST | `/drivers` | `drivers.manage` | multipart : `last_name, first_name, birth_date, phone, address, driver_identifier`, `paper_form?` (fichier) | `Driver` créé **en attente** | 422 |
| GET | `/drivers/{id}` | `drivers.view` | — | `Driver` | 404 |
| POST | `/drivers/{id}?_method=PUT` | `drivers.manage` | multipart, mêmes champs que la création | `Driver` | 409 archivé ; 422 |
| POST | `/drivers/{id}/photo` | `drivers.manage` | multipart `photo` (JPEG carré 600 × 600, déjà recadré) | `Driver` | 409 ; 422 |
| POST | `/drivers/{id}/assignment` | `drivers.manage` | `{ motorcycle_id, started_at?, reason? }` (date et motif obligatoires pour un changement) | `Driver` ; l'affectation en cours est clôturée | **422 `motorcycle_id`** : « Cette moto est déjà affectée à un autre conducteur » |
| GET | `/drivers/{id}/assignments` | `drivers.view` | — | `Assignment[]` (plus récente d'abord) | — |
| POST | `/drivers/{id}/validate` | `drivers.manage` | — | `Driver` (`zc_number` attribué, QR généré, statut `actif`) | **422 `{ errors: { activation: ['photo'|'piece_identite'|'permis'|'moto', …] } }`** ; 409 si pas en attente |
| PATCH | `/drivers/{id}/status` | `drivers.manage` | `{ status: 'suspendu'|'actif', reason }` (motif obligatoire pour suspendre) | `Driver` | 409 transition impossible ; 422 `reason` |
| POST | `/drivers/{id}/archive` | `drivers.manage` | `{ reason }` | `Driver` (QR révoqué, affectation clôturée) | 409 ; 422 `reason` |
| GET | `/drivers/{id}/history` | `drivers.view` | — | `LogEntry[]` (audit et consultations de ce conducteur) | — |

Validation d'un dossier : photo, pièce d'identité, permis et moto affectée sont exigés. La conformité ne l'est pas : un dossier validé peut être non conforme.

### Documents (`services/documents`)

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| POST | `/drivers/{id}/documents`, `/motorcycles/{id}/documents` | `documents.manage` | multipart : `type, number, issued_at, expires_at` (vide = pas d'expiration ; **obligatoire pour l'assurance**), `file` | `Document` ; le document actuel du même type passe dans l'historique (`superseded_at`) | 422 (`expires_at` de l'assurance, format ou taille de fichier) |
| GET | `/drivers/{id}/documents/history`, `/motorcycles/{id}/documents/history` | `drivers.view` / `motorcycles.view` | — | `Document[]` remplacés | — |
| GET | `/documents/{id}/file` | `drivers.view` (lecture, administrateur compris) | — | `{ url, expires_at }` : **URL temporaire signée** | 404 aucun fichier |

### QR et badge (`services/qr`)

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/drivers/{id}/qr-codes` | `drivers.view` | — | `QrCode[]` (un seul actif) | — |
| POST | `/drivers/{id}/qr-codes/regenerate` | `qr.manage` | `{ reason }` | `QrCode` (l'ancien ne fonctionne plus) | 409 dossier en attente ou archivé ; 422 `reason` |
| POST | `/drivers/{id}/qr-codes/revoke` | `qr.manage` | `{ reason }` | `QrCode` révoqué | 409 aucun QR actif ; 422 |
| GET | `/drivers/{id}/qr-codes/active.png`, `.svg` | `drivers.view` | — | fichier image (blob) | 404 |
| GET | `/drivers/{id}/badge.pdf` | `drivers.view` | — | PDF du badge (photo, nom, prénom, numéro, QR, domaine, bandeau jaune) | 404 |

### Motos (`services/motorcycles`)

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/motorcycles?search&unassigned&page&per_page` | `motorcycles.view` | — | `Paginated<Motorcycle>` (`unassigned=true` : sans conducteur et non archivées) | — |
| POST | `/motorcycles` | `motorcycles.manage` | `{ plate_number, brand, model|null, color|null, year|null, chassis_number|null }` | `Motorcycle` | 422 `plate_number` déjà existante |
| GET | `/motorcycles/{id}` | `motorcycles.view` | — | `Motorcycle` | 404 |
| PUT | `/motorcycles/{id}` | `motorcycles.manage` | comme la création | `Motorcycle` | 409 archivée ; 422 |
| POST | `/motorcycles/{id}/archive` | `motorcycles.manage` | — | `Motorcycle` | **409 tant que la moto est affectée** (« Changez d'abord la moto du conducteur ») |
| GET | `/motorcycles/{id}/assignments` | `motorcycles.view` | — | `Assignment[]` | — |

### Agents (`services/agents`)

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/agents?search&account_status&page&per_page` | `agents.view` | — | `Paginated<User>` | — |
| POST | `/agents` | `agents.manage` | `{ first_name, last_name, email, phone|null, matricule, structure }` | `User` (`must_change_password: true`, email d'invitation envoyé) | 422 `email` ou `matricule` déjà utilisés |
| GET | `/agents/{id}` | `agents.view` | — | `User` | 404 |
| PUT | `/agents/{id}` | `agents.manage` | comme la création | `User` | 409 archivé ; 422 |
| PATCH | `/agents/{id}/status` | `agents.manage` | `{ status: 'actif'|'desactive' }` | `User` ; désactivé = **sessions révoquées immédiatement** | 409 |
| POST | `/agents/{id}/archive` | `agents.manage` | — | `User` | 409 |
| POST | `/agents/{id}/reset-link` | `agents.manage` | — | `null` (email envoyé) | 409 compte non actif |

### Gestionnaires (`services/managers`) — administrateur

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/admin/managers?search&page&per_page` | `managers.view` | — | `Paginated<User>` (rôle gestionnaire **uniquement** ; l'administrateur connecté n'y figure jamais) | — |
| POST | `/admin/managers` | `managers.manage` | `{ first_name, last_name, email, phone|null }` | `User` (mot de passe provisoire envoyé par email) | **422 `email` déjà utilisé** |
| GET | `/admin/managers/{id}` | `managers.view` | — | `User` | 404 |
| PUT | `/admin/managers/{id}` | `managers.manage` | comme la création | `User` | 409 ; 422 |
| PATCH | `/admin/managers/{id}/status` | `managers.manage` | `{ status: 'actif'|'desactive', reason|null }` (**motif obligatoire pour désactiver**) | `User` ; désactivé = déconnecté immédiatement | 409 propre compte ou archivé ; 422 `reason` |
| POST | `/admin/managers/{id}/archive` | `managers.manage` | `{ reason }` (obligatoire) | `User` | 409 ; 422 `reason` |
| POST | `/admin/managers/{id}/reset-link` | `managers.manage` | — | `null` | 409 |

Garde-fou côté API : un administrateur ne peut jamais se désactiver ni s'archiver lui-même.

### Paramètres (`services/settings`) — administrateur

| Méthode | URL | Permission | Corps | Réponse | Erreurs |
| --- | --- | --- | --- | --- | --- |
| GET | `/admin/settings` | `settings.manage` | — | `{ structure_name|null, structure_contact|null, expiry_warning_days: 30 }` | — |
| PUT | `/admin/settings` | `settings.manage` | `{ structure_name|null, structure_contact|null }` | idem | 422 |

`expiry_warning_days` est une règle fixe (30), non modifiable. La structure renseignée apparaît sur le profil public ; vide, la ligne disparaît.

### Journaux (`services/logs`) — lecture seule

| Méthode | URL | Permission | Paramètres | Réponse |
| --- | --- | --- | --- | --- |
| GET | `/logs` | `logs.view` | `kind` (`audit`, `consultation`, `connexion`), `actor` (nom), `action`, `role` (`admin`, `gestionnaire`, `agent`), `result` (`reussie`, `echouee`, `bloquee`), `driver` (nom ou numéro), `driver_id`, `start_date`, `end_date`, `page`, `per_page` | `Paginated<LogEntry>` (plus récent d'abord) |
| GET | `/logs/actors?kind=` | `logs.view` | `kind` | `string[]` (auteurs possibles, pour le filtre « Utilisateur ») |

L'onglet « Connexions » (`kind=connexion`) est réservé à l'administrateur. Le gestionnaire voit l'audit et les consultations. Aucune route de modification, de suppression ni d'export.
