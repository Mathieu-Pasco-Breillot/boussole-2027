# Glossaire des acronymes — conception

Date : 13 octobre 2026. Issue : #7. Statut : conception validée en discussion, spec à relire.

## 1. Objectif

Un visiteur non spécialiste qui croise un sigle (COR, CSG, OQTF…) doit obtenir son explication sans quitter la page. Le comportement dépend de l'appareil : bulle et panneau latéral sur ordinateur, feuille du bas sur mobile.

## 2. Décisions déjà prises

- Périmètre : tous les textes de l'application (énoncés, Précisions, origines, encart Impact, extraits et citations de candidats, résultats, duel, défi, banque de questions, fiches, pages éditoriales rendues par `Markdown.tsx`, texte écrit en dur dans les écrans).
- Ordinateur : survol ou focus clavier sur un sigle = bulle rapide avec la définition ; clic = ouverture du panneau glossaire latéral à droite, défilement jusqu'à l'entrée et mise en évidence. Un bouton « Glossaire » ouvre et rétracte le panneau à tout moment.
- Mobile : tap sur un sigle ou son (i) = feuille du bas (définition demandée en haut, puis liste complète). Un bouton « Glossaire » ouvre la même feuille.
- Le (i) n'apparaît que sur les appareils sans survol, et seulement à la première occurrence d'un sigle dans un bloc de texte ; les occurrences suivantes restent soulignées en pointillé et cliquables, sans (i).
- Ouverture et fermeture par le même composant de contenu (`ListeGlossaire`), présenté en panneau (≥ 1024 px) ou en feuille (< 1024 px).

## 3. Architecture

### 3.1 Données
- `data/glossaire.json` : tableau d'entrées `{ sigle, developpe, explication, formes? }`. `sigle` unique ; `formes` liste les variantes de casse ou d'écriture à reconnaître (ex. « CESEDA », « Ceseda »). `explication` : une phrase factuelle et neutre, 25 mots au plus.
- `schemas/glossaire.schema.json` (propriétés additionnelles interdites), branché dans `scripts/lib/validate.ts` et `scripts/lib/dataset.ts` (chargement), types générés par `scripts/generate-types.ts`.
- Intégré au paquet (`scripts/bundle.ts` → `app/donnees/paquet.json`, clé `glossaire`, trié par ordre alphabétique français) ; type ajouté dans `app/paquet.ts`. Il n'entre pas dans l'empreinte qui déclenche `derive` : il n'a aucun effet sur les scores.

### 3.2 Détection
- Fonction pure `segmenter(texte, index)` (dans `core/glossaire/`, sans dépendance au DOM) qui renvoie une liste de segments `{ type: 'texte', texte }` ou `{ type: 'sigle', texte, sigle, premiere }`.
- Correspondance exacte, sensible à la casse, sur mots entiers (bornes `(?<![\p{L}\p{N}])` et `(?![\p{L}\p{N}])`, drapeau `u`), les formes les plus longues d'abord (« PLFSS » avant « PLF »). `premiere` vaut vrai pour la première occurrence de chaque sigle dans l'appel.

### 3.3 Interface
- `GlossaireProvider` (contexte React) : état `{ ouvert, entree }` et actions `ouvrir(sigle)`, `fermer()`, `basculer()`. Branché à la racine de l'application.
- `<Texte>{chaine}</Texte>` remplace l'affichage brut des chaînes issues des données. Dans un lien, un bouton ou un `<summary>`, aucun sigle n'est annoté (pas de contrôle interactif imbriqué) : le texte reste brut.
- `<Sigle>` : un seul `<button type="button">` souligné en pointillé. Bulle (`role="tooltip"`, `aria-describedby`) affichée au survol et au focus sur les appareils avec survol, descriptible, persistante tant qu'elle est survolée, fermée par Échap (critère WCAG 1.4.13). Le clic appelle `ouvrir(sigle)`. Le (i) est un glyphe décoratif (`aria-hidden`) à l'intérieur du même bouton, affiché sous `@media (hover: none)`.
- `PanneauGlossaire` (≥ 1024 px) : panneau fixe à droite, rétractable, qui réserve sa largeur (marge à droite du contenu) quand il est ouvert. `FeuilleGlossaire` (< 1024 px) : `role="dialog"`, `aria-modal`, piège de focus, fermeture par Échap, tap sur le fond ou bouton de fermeture, retour du focus au déclencheur.
- `ListeGlossaire` : liste alphabétique, chaque entrée porte un identifiant d'ancre ; l'entrée demandée est mise en évidence (`aria-current`) et amenée dans la vue (`scrollIntoView`, comportement instantané si `prefers-reduced-motion`).
- Un bouton « Glossaire » persistant (emplacement à fixer dans le plan, selon `App.tsx`) ouvre le panneau ou la feuille sans passer par un sigle.

## 4. Accessibilité
- Tout est utilisable au clavier (Tab, Entrée/Espace, Échap) ; aucun piège de focus hors de la feuille modale.
- Les bulles respectent WCAG 1.4.13 ; le contraste des soulignements et du panneau respecte les tokens existants (nuit, creme, or, sourdine) en thèmes sombre et clair.
- Contrôle axe sur les états ouverts (bulle, panneau, feuille) dans Playwright.

## 5. Contenu du glossaire
- Environ 60 entrées, à partir de l'inventaire des sigles présents dans les textes affichés (PIB, AN, UE, OTAN, SMIC, TVA, RSA, CSG, CVAE, ISF, IFI, CESE, COR, RATP, EDF, RTE, CESEDA, PLFSS, QPC…). L'inventaire exact sera refait en se limitant aux champs affichés (énoncé, Précision, origine, encart Impact, titres de sources, pages), en écartant les identifiants, les URL et les faux positifs (« OK »).
- Règles : forme développée exacte (nom officiel) ; explication d'une phrase, factuelle, neutre, sans jugement ; pour les partis et mouvements, la forme développée et la mention neutre « Parti politique » ou « Mouvement politique » uniquement ; aucun nom de personne.
- Rédaction puis relecture aveugle par un agent différent, comme pour l'encart Impact.

## 6. Tests
- Unitaires (`vitest`, environnement node) : `segmenter` (sigles collés à la ponctuation, plus long sigle d'abord, accents, formes multiples, première occurrence) ; schéma du glossaire.
- Exhaustivité : un test échoue si un mot en majuscules de 2 lettres ou plus apparaît dans les textes affichés (paquet et pages) sans entrée au glossaire ni exception explicite (liste d'exceptions dans le test).
- Playwright : sur ordinateur, la bulle apparaît au survol, le clic ouvre le panneau à la bonne entrée, le panneau se rétracte, Échap ferme la bulle ; sur Pixel 7, le (i) est visible à la première occurrence seulement, le tap ouvre la feuille, qui se ferme par Échap et par le bouton ; contrôle axe sur chaque état ; `e2e/csp.spec.ts` doit rester vert.
- Le projet n'a ni jsdom ni testing-library : la logique (segmentation, état du fournisseur) reste dans des fonctions pures testées en unitaire ; le rendu est couvert par Playwright.

## 7. Hors périmètre (reporté)
- Recherche dans le glossaire, détection automatique des sigles inconnus, développement du sigle dans le texte à la première occurrence, traductions, mémorisation de l'état du panneau entre sessions.

## 8. Risques et points à fixer dans le plan
- Positionnement de la bulle sans nouvelle dépendance (CSS d'abord ; ajouter une bibliothèque seulement si nécessaire).
- Respect de la politique CSP existante (aucun style inline interdit par la CSP ; à vérifier avec `e2e/csp.spec.ts`).
- Décalage de mise en page à l'ouverture du panneau sur ordinateur (le contenu est centré en `max-w-xl`).
- Boutons dans un titre `<h1>` (énoncé) : les tests e2e existants lisent le texte du titre ; vérifier qu'ils restent verts.
- Rendu de `Markdown.tsx` : intégrer `<Texte>` aux nœuds de texte sans casser le rendu minimal existant.

## 9. Découpage prévu (pour le plan)
1. Données et pipeline : schéma, chargement, bundle, types, `segmenter` et tests unitaires.
2. Interface : fournisseur, `<Texte>`, `<Sigle>`, `ListeGlossaire`, panneau, feuille, bouton « Glossaire », intégration écran par écran.
3. Contenu : inventaire, rédaction des entrées, relecture aveugle (parallélisable avec le lot 2 une fois le schéma fixé).
4. Tests de bout en bout et accessibilité.
5. Documentation (page méthodologie si pertinent) et passation.
