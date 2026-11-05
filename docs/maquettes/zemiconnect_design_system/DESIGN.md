---
name: ZemiConnect Design System
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#40484c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#71787d'
  outline-variant: '#c0c7cd'
  surface-tint: '#2e647c'
  primary: '#003548'
  on-primary: '#ffffff'
  primary-container: '#0e4d64'
  on-primary-container: '#89bdd8'
  inverse-primary: '#99cee9'
  secondary: '#576063'
  on-secondary: '#ffffff'
  secondary-container: '#d8e1e5'
  on-secondary-container: '#5b6468'
  tertiary: '#492a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#653f0e'
  on-tertiary-container: '#e2ac71'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bfe8ff'
  primary-fixed-dim: '#99cee9'
  on-primary-fixed: '#001f2b'
  on-primary-fixed-variant: '#0d4d63'
  secondary-fixed: '#dbe4e8'
  secondary-fixed-dim: '#bfc8cc'
  on-secondary-fixed: '#141d20'
  on-secondary-fixed-variant: '#3f484c'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#f4bc80'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#643e0d'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg-medium:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm-medium:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Public Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  tabular-code:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  tabular-plate:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

Ce système de design est conçu pour équiper les agents de régulation, les forces municipales et les syndicats de transport dans le cadre du contrôle sur le terrain des conducteurs de taxi-moto (zémidjans) à Parakou, Bénin.

### Personnalité et Posture
- **Institutionnelle & Républicaine :** Une rigueur administrative sans faille qui inspire l'autorité bienveillante et la transparence civique.
- **Opérationnelle & Sans Compromis :** Conçue pour une lisibilité instantanée en conditions extérieures extrêmes (plein soleil subsaharien, poussière, mobilité à bout de bras).
- **Précise & Pragmatique :** L'information critique (numéro de matricule, assurance, identité) prime sur tout artifice graphique.

### Direction Artistique
Le style est résolument **Flat & Structuré**. Tout effet d'élévation simulée (skêuomorphisme, dégradés, ombres portées douces) est banni. La profondeur et la hiérarchie sont assurées exclusivement par des délimitations nettes au trait (`#D9E1E5`), des contrastes chromatiques tranchés et une alternance rythmique de conteneurs opaques sur fond neutre.

## Colors

La palette s'articule autour d'une stricte gouvernance fonctionnelle adaptée au terrain :

### Palette Principale
- **Primary (`#0E4D64`) :** Bleu pétrole institutionnel. Utilisé pour la structure d'encadrement, les barres d'application, les boutons d'action principale et les en-têtes majeurs. Le texte sur cette teinte est obligatoirement blanc pur (`#FFFFFF`).
- **Secondary / Surface Tint (`#E6EFF3`) :** Bleu brume servant d'aplats de mise en relief discrète, de surbrillance d'états sélectionnés ou d'arrière-plan de fiches d'inspection secondaire.
- **Accent (`#F4B400`) :** Jaune zémidjan signature. Strictement réservé au logo de la plateforme, au bouton d'action critique « Scanner un QR » et au bandeau distinctif des badges d'authentification. Le texte ou l'icône appliqué sur cette teinte est systématiquement foncé (`#13212B`).

### Fonds, Surfaces et Bords
- **Background (`#F7F9FA`) :** Toile de fond neutre pour éviter l'éblouissement en plein soleil.
- **Surface (`#FFFFFF`) :** Cartes, panneaux et fiches d'identité. Doit être systématiquement détouré par la bordure fonctionnelle.
- **Border (`#D9E1E5`) :** Séparateur universel de 1px garantissant l'intégrité visuelle sans aucune ombre.
- **Text Primary (`#13212B`) :** Noir bleuté profond assurant un ratio de contraste maximal conforme aux normes d'accessibilité AAA.
- **Text Muted (`#5B6B75`) :** Gris ardoise pour les métadonnées, labels techniques et légendes secondaires.

### Couleurs Fonctionnelles de Statut
- **Succès (`#1E7B45` / fond `#E8F5EE`) :** Situations conformes, validité active, contrôles approuvés.
- **Attention (`#B35C00` / fond `#FFF1E0`) :** Titres proches de l'expiration, dossiers incomplets, vérifications partielles.
- **Danger (`#B42318` / fond `#FDECEA`) :** Suspendu, non autorisé, fraude détectée, assurance expirée.
- **Neutre (`#5B6B75` / fond `#EEF1F3`) :** Conducteurs archivés, inactifs ou hors zone de contrôle.

## Typography

L'architecture typographique repose sur la clarté géométrique de **Manrope** pour les titres et la neutralité administrative institutionnelle de **Public Sans** pour le texte courant.

### Règles Typographiques
- **Titres (`Manrope`) :** Systématiquement fixés à `font-weight: 600`. Ils définissent les zones de contrôle, l'état civil du conducteur et les rubriques de vérification.
- **Corps de texte (`Public Sans`) :** Standardisé à `16px` (`body-lg`) pour tous les flux mobiles principaux afin de garantir une lecture sans fatigue oculaire en mobilité. Les listes denses et les tableaux techniques utilisent le palier `14px` (`body-sm`).
- **Chiffres tabulaires & Identifiants :** Tout identifiant opérationnel (plaque d'immatriculation béninoise, numéro d'enregistrement municipal, code IFU, permis de conduire, horodatage) utilise obligatoirement la police à espacement fixe avec la propriété `font-variant-numeric: tabular-nums` pour éliminer tout risque d'erreur d'interprétation lors des contrôles rapides.

## Layout & Spacing

Le gabarit répond aux contraintes d'une utilisation opérationnelle sur terminal mobile Android durci ou standard.

### Rythme et Grille
- **Disposition Mobile Native :** Système sur une colonne principale fluide avec marges extérieures fixes de `1rem` (16px).
- **Densité Optimale Terrain :** Les séparations verticales entre modules de contrôle utilisent un espacement régulier de `space-md` (12px) ou `space-lg` (16px), évitant les déroulements infinis tout en maintenant des cibles de contact tactile confortables (minimum 48px de hauteur pour toute zone cliquable).
- **Alignements :** Les données d'inspection suivent une grille stricte en 2 colonnes étiquetées : Libellé à gauche en `Text Muted`, Valeur vérifiée à droite en `Text Primary` ou police tabulaire.

## Elevation & Depth

Le design system applique une stricte politique de **zéro ombre portée (`box-shadow: none`)**.

### Justification et Implémentation
- **Lisibilité Solaire :** Les ombres floues deviennent invisibles ou génèrent une sensation de flou d'affichage sous la lumière zénithale de Parakou.
- **Contours Nets à Faible Épaisseur :** La hiérarchie visuelle est établie exclusivement par une bordure continue de `1px solid #D9E1E5` appliquée à toutes les surfaces (`#FFFFFF`).
- **Superposition Modale :** Lors de l'ouverture d'un panneau d'inspection critique ou d'une feuille de dialogue, l'arrière-plan reçoit un filtre assombrissant franc (`rgba(19, 33, 43, 0.6)`) et la modale s'affiche avec son contour net sur fond blanc pur, maintenant une séparation sans ambiguïté.

## Shapes

La géométrie des composants équilibre rigueur institutionnelle et ergonomie tactile moderne :

### Barème des Rayons de Courbure
- **8px (`border-radius: 8px`) :** Norme standard appliquée aux cartes de profil, conteneurs d'informations, champs de saisie, boutons d'action et alertes contextuelles.
- **12px (`border-radius: 12px`) :** Réservé exclusivement aux conteneurs flottants, modales de confirmation et tiroirs inférieurs (bottom sheets).
- **4px (`border-radius: 4px`) :** Appliqué aux puces de statut, badges compacts et étiquettes d'immatriculation.
- **9999px (Pill) :** Strictement interdit pour les cartes et boutons d'action ; réservé aux pastilles circulaires de voyant lumineux.

## Components

### 1. Boutons
- **Bouton Scan QR (Action Maîtresse) :** Fond Jaune Zémidjan (`#F4B400`), texte et icône de cadrage QR en `#13212B`, typographie `Manrope` 600, rayon 8px, hauteur 52px. Bordure invisible ou ton sur ton.
- **Bouton Primaire de Validation :** Fond Bleu Pétrole (`#0E4D64`), texte blanc (`#FFFFFF`), hauteur 48px, rayon 8px.
- **Bouton Secondaire d'Action :** Fond Bleu Brume (`#E6EFF3`), texte `#0E4D64`, hauteur 48px, rayon 8px.
- **Bouton Neutre / Annulation :** Fond blanc (`#FFFFFF`), bordure 1px `#D9E1E5`, texte `#5B6B75`.

### 2. Badges et Indicateurs de Contrôle (Règle Stricte)
L'évaluation d'un conducteur se fait toujours via deux indicateurs présentés côte à côte :
- **Badge de Statut Opérationnel (Plein) :**
  Fond teinté plein avec texte contrasté. Exemples :
  * *Actif / En règle :* Fond `#E8F5EE`, texte `#1E7B45`.
  * *Suspendu / Infraction :* Fond `#FDECEA`, texte `#B42318`.
  * *En attente :* Fond `#FFF1E0`, texte `#B35C00`.
- **Badge de Conformité Légale (Contour avec Icône Bouclier) :**
  Fond blanc pur (`#FFFFFF`), bordure 1.5px colorée selon l'état d'agrément, accompagné de l'icône de bouclier (Lucide `ShieldCheck` ou `ShieldAlert`) positionnée à gauche du texte.
  * *Exemple Conforme :* Bordure `#1E7B45`, texte `#1E7B45`, icône bouclier vert.

### 3. Fiches Conducteur & Cartes d'Inspection
- Fond blanc pur (`#FFFFFF`), rayon 8px, bordure 1px `#D9E1E5`, zéro ombre.
- **En-tête de Carte :** Bandeau supérieur jaune `#F4B400` de 6px pour le zémidjan accrédité ou bandeau neutre `#E6EFF3`.
- Zone photo d'identité format passeport (64x64px), bordure nette 1px `#D9E1E5`, affichant le visage du conducteur à côté du nom légal en `headline-sm` et du matricule municipal en `tabular-code`.

### 4. Champs de Saisie et Filtres
- Hauteur de 48px, fond `#FFFFFF`, bordure 1px `#D9E1E5`, rayon 8px, texte `#13212B` en 16px.
- État focus : bordure 2px `#0E4D64` sans halo ni ombre externe.
- Libellé toujours visible au-dessus du champ en `Public Sans` 12px semi-bold `#5B6B75`.

### 5. Tableaux et Listes de Contrôle
- Séparateurs horizontaux de 1px `#D9E1E5`.
- Lignes de tableau : texte 14px (`body-sm`), alternance d'états cliquables avec effet hover/active en `#E6EFF3`.
- Numéros de série et plaques d'immatriculation alignés à droite ou encadrés dans un bloc monospace tabulaire `#13212B`.

### 6. Iconographie
- Tracé filaire précis, style Lucide, épaisseur constante de 1.75px à 2px, format standard 20x20px ou 24x24px, garantissant une netteté totale sur écran haute densité en milieu lumineux.