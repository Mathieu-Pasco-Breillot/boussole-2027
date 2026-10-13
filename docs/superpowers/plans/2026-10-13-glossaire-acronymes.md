# Glossaire des acronymes — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** permettre à tout visiteur d'obtenir l'explication d'un sigle (COR, CSG, OQTF…) sans quitter la page : bulle et panneau latéral sur ordinateur, feuille du bas sur mobile.

**Architecture :** un fichier de données `data/glossaire.json` (schéma, validation, types générés) entre dans le paquet de l'application sous la clé `glossaire`, hors empreinte. Une fonction pure `segmenter` (`core/glossaire/`) découpe chaque texte affiché en segments texte/sigle ; un composant `<Texte>` rend ces segments, chaque sigle devenant un `<Sigle>` (bouton + bulle). Un `GlossaireProvider` (réducteur pur testé en unitaire) pilote l'ouverture d'une même liste `ListeGlossaire`, présentée en `PanneauGlossaire` (≥ 1024 px) ou en `FeuilleGlossaire` (`<dialog>` modal, < 1024 px), avec un bouton « Glossaire » flottant.

**Tech Stack :** TypeScript 7, React 19, Vite 8, Tailwind 4, JSON Schema 2020-12 + Ajv 8, json-schema-to-typescript, Vitest 5 (environnement node, fast-check), Playwright 1.63 + @axe-core/playwright.

**Spec :** `docs/superpowers/specs/2026-10-13-glossaire-acronymes-design.md`

**Worktree :** `/home/mathieu/projects/Perso/choose-your-candidate-2027/.worktree/glossaire-acronymes` (branche `feat/7-glossaire-acronymes`). Toutes les commandes s'y exécutent. Prérequis : `npm ci` (déjà fait à la rédaction du plan ; base : 23 fichiers de test, 327 tests verts).

## Global Constraints

- Commits Conventional Commits en français, impératif présent, sans majuscule initiale ni point final, scope `glossaire` (jamais un numéro de ticket) ; le hook `conventional-commit` refuse tout `git commit -m` non conforme.
- Pied de chaque commit, exactement (dernier paragraphe) : `Refs #7` puis `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` puis `Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY`.
- Les commits sont passés par l'agent `git-ops` (workflow superviseur) avec le message exact donné dans chaque tâche ; timeout ≥ 120 s ; jamais de push sans accord de l'utilisateur.
- Avant tout commit qui touche `data/`, `schemas/` ou le paquet : `npm run derive && npm run bundle && npm run check` (tout vert).
- Fichiers générés, jamais édités à la main, toujours régénérés et commités : `core/types.generated.ts` (`npm run types:generate`), `app/donnees/paquet.json` et `app/donnees/pages.json` (`npm run bundle`), `derive/` (`npm run derive`, qui ne doit pas changer : le glossaire est hors empreinte).
- Aucun nom de personne dans le glossaire (ni `developpe` ni `explication`) ; partis et mouvements : explication réduite à « Parti politique. » ou « Mouvement politique. ».
- `explication` : une phrase factuelle et neutre, 25 mots au plus (règle bloquante de `npm run data:validate`).
- Bulle conforme WCAG 1.4.13 : affichée au survol et au focus (appareils avec survol seulement), persistante tant qu'elle est survolée, fermée par Échap sans déplacer le focus.
- Aucun contrôle interactif imbriqué : jamais de `<Texte>` dans un `<a>`, un `<button>`, un `<summary>` ou un `<label>`.
- Aucun composant testé hors Playwright : vitest tourne en environnement node sans jsdom ni testing-library ; toute logique (segmentation, état) vit dans des fonctions pures testées en unitaire, le rendu est couvert par Playwright + axe.
- Les fichiers `app/glossaire/*.ts` importés par des tests ou des scripts node restent sans DOM (`tsconfig.node.json` n'a pas la lib DOM) ; le code DOM va dans des `.tsx` ou dans `app/glossaire/media.ts` (non listé dans `tsconfig.node.json`).
- Dans `e2e/`, aucune fonction passée à `page.evaluate` ne touche `document`, `window` ou `matchMedia` (erreur TS2584, `tsconfig.node.json` sans DOM) : utiliser une expression en chaîne, comme `e2e/theme.spec.ts`.
- Pas de nouvelle dépendance (positionnement de la bulle en CSS, feuille en `<dialog>` natif).
- Couleurs : uniquement les tokens `nuit`, `nuit-clair`, `creme`, `sourdine`, `or` (classes Tailwind ou `var(--color-…)`), vérifiés en thèmes sombre et clair (axe dans les deux).
- CSP du Caddyfile (`style-src 'self'`, aucun style inline) : aucun attribut `style` ni `<style>` ; tout le style dans `app/index.css` ou en classes Tailwind ; `e2e/csp.spec.ts` reste vert.
- Fermé, le glossaire n'est pas dans le DOM (liste montée seulement à l'ouverture, bulle seulement quand elle est visible) : `e2e/parcours.spec.ts` vérifie l'absence de noms de partis dans `body` pendant le quiz.
- `docs/methodologie.md` n'est pas modifié (méthode versionnée et validée ; le glossaire n'a aucun effet sur le calcul).
- Lancement local de Playwright : `npm run build` puis `PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test <fichiers>` ; s'assurer qu'aucun autre `vite preview` n'occupe le port 4173 (`reuseExistingServer` le réutiliserait).

## Review Focus

Les cinq conditions que la spec implique sans qu'une tâche ne les teste d'office, et le test qui les épingle :

1. **Bornes Unicode des sigles** : sigle collé à une apostrophe typographique (« l’OTAN », « d’UE »), en début ou en fin de texte, collé à la ponctuation (« (TVA) », « TVA/UE », espaces insécables), suivi d'un chiffre (« EPR2 ») ou précédé d'une lettre accentuée (« éUE »). Épinglé dans T2 (`core/glossaire/segmenter.test.ts`, blocs « bornes » et propriété fast-check).
2. **Formes qui se chevauchent** : sigle court contenu dans un mot plus long (« UE » dans « UEFA », « AN » dans « ANNÉE », « PLF » dans « PLFSS »), forme d'une entrée identique au sigle d'une autre. Épinglé dans T2 (« plus long d'abord », « mot plus long ») et T1 (règle `forme-glossaire-reutilisee`).
3. **Entrées dégénérées de l'état** : texte vide ou `null`, `ouvrir()` d'un sigle inconnu, réouverture du même sigle (le défilement doit repartir), `basculer` pendant une ouverture sur entrée. Épinglé dans T2 (« texte vide ») et T3 (`app/glossaire/etat.test.ts`, dont une propriété fast-check sur les invariants).
4. **Contrôles imbriqués et DOM du glossaire fermé** : sigle dans un lien, un bouton, un `<summary>` ou un `<label>` ; titre `<h1>` contenant des boutons ; glossaire absent du DOM quand il est fermé. Épinglé dans T4 (`body` ne contient pas la définition, glossaire fermé) et T5 (« aucun sigle annoté dans un lien, un bouton, un summary ou un label » sur banque, fiche, méthode et quiz).
5. **Ouvertures simultanées, focus et mouvement** : bulle et panneau ouverts ensemble (Échap ne ferme que la bulle), retour du focus au déclencheur après fermeture de la feuille par Échap, par le bouton et par le fond, `prefers-reduced-motion` (défilement instantané ou doux). Épinglé dans T3 (`comportementDefilement`) et T7 (`e2e/glossaire.spec.ts`, tests « ordinateur », « téléphone » et « animations permises »).

## Plan de fichiers

| Fichier | Action | Responsabilité |
|---|---|---|
| `schemas/glossaire.schema.json` | Créer | Forme d'une entrée (propriétés additionnelles interdites) |
| `schemas/journal.schema.json` | Modifier | Type de journal `ajout_glossaire` |
| `data/glossaire.json` | Créer | Source de vérité du glossaire |
| `data/journal.json` | Modifier (T6) | Trace de la création du glossaire |
| `scripts/lib/dataset.ts` | Modifier | Chargement de `glossaire.json`, hors empreinte |
| `scripts/lib/validate.ts` | Modifier | Schéma + règles transversales du glossaire |
| `scripts/validate.ts` | Modifier | Statistique affichée |
| `scripts/lib/jeu-synthetique.ts` | Modifier | Jeu de test valide avec un glossaire |
| `scripts/lib/glossaire.ts` | Créer | `paquetGlossaire` : tri alphabétique français pour le paquet |
| `scripts/glossaire.test.ts` | Créer | Tests du tri et de la cohérence du paquet |
| `scripts/validate.test.ts` | Modifier | Tests des règles du glossaire et de l'empreinte |
| `scripts/bundle.ts` | Modifier | Clé `glossaire` du paquet |
| `core/types.generated.ts` | Régénérer | Espace de noms `Glossaire` |
| `app/paquet.ts` | Modifier | Type `glossaire` du paquet |
| `core/glossaire/segmenter.ts` | Créer | `indexer`, `segmenter` (pur, sans DOM) |
| `core/glossaire/inventaire.ts` | Créer | `extraireSigles` (mots en capitales) |
| `core/glossaire/index.ts` | Créer | API publique |
| `core/glossaire/segmenter.test.ts`, `core/glossaire/inventaire.test.ts` | Créer | Tests unitaires |
| `core/README.md` | Modifier | Ligne `core/glossaire/` |
| `app/glossaire/etat.ts`, `app/glossaire/etat.test.ts` | Créer | Réducteur pur et sélecteurs, testés |
| `app/glossaire/donnees.ts` | Créer | Index et entrées construits une fois depuis le paquet |
| `app/glossaire/GlossaireProvider.tsx` | Créer | Contexte, actions, retour du focus |
| `app/glossaire/media.ts` | Créer | `useMedia` (requête média réactive) |
| `app/glossaire/ListeGlossaire.tsx` | Créer | Liste alphabétique + `DefinitionGlossaire` |
| `app/glossaire/PanneauGlossaire.tsx` | Créer | Présentation ≥ 1024 px |
| `app/glossaire/FeuilleGlossaire.tsx` | Créer | Présentation < 1024 px (`<dialog>` modal) |
| `app/glossaire/CadreGlossaire.tsx` | Créer | Bouton « Glossaire », réserve de largeur, choix panneau/feuille |
| `app/glossaire/Sigle.tsx` | Créer | Bouton du sigle, bulle, (i) |
| `app/glossaire/Texte.tsx` | Créer | Rendu annoté d'une chaîne |
| `app/glossaire/exceptions.ts` | Créer (T6) | Mots en capitales qui ne sont pas des sigles |
| `app/glossaire/textes.ts` | Créer (T6) | Liste des textes affichés et annotés |
| `app/glossaire.test.ts` | Créer (T6) | Exhaustivité et règles de contenu |
| `scripts/inventaire-glossaire.ts` | Créer (T6) | Inventaire déterministe des sigles |
| `app/App.tsx` | Modifier | Branchement du fournisseur et du cadre |
| `app/index.css` | Modifier | Styles du sigle, de la bulle, de la feuille, marge du bouton |
| `app/ecrans/{Quiz,QuizDuel,Depliants,Extraits,Resultats,ResultatsDuel,Defi,Vieprivee}.tsx` | Modifier | `<Texte>` sur les textes affichés |
| `app/pages/{Markdown,Methode,Banque,FicheCandidat}.tsx` | Modifier | `<Texte>` sur les textes affichés |
| `tsconfig.node.json` | Modifier | Tests de `app/glossaire` vérifiés par `tsc` |
| `package.json` | Modifier (T6) | Script `glossaire:inventaire` |
| `e2e/glossaire.spec.ts` | Créer | Parcours du glossaire, axe |
| `e2e/largeur.spec.ts` | Modifier | Sélecteur des fiches insensible aux sigles annotés |
| `docs/glossaire/consigne-redaction.md`, `docs/glossaire/consigne-relecture.md` | Créer (T6) | Consignes des agents |
| `docs/glossaire/relecture.json` | Créer (T6) | Trace de la relecture aveugle |
| `docs/glossaire/README.md`, `README.md` | Créer / Modifier (T8) | Passation |

## Ordre et parallélisme

- T1 → T2, puis deux branches : **interface** T3 → T4 → T5, et **contenu** T6 (outillage, rédaction, relecture), parallélisable avec T3–T5 dès que T2 est commitée (fichiers disjoints, sauf `tsconfig.node.json`, touché par T3 et T6 : commiter l'un puis l'autre, la modification est d'une ligne chacun).
- T7 après T5 et T6 (le glossaire complet rend significatifs le défilement et la liste longue). T8 en dernier.
- Le test d'exhaustivité (`app/glossaire.test.ts`) n'est commité qu'avec le contenu (T6) : jamais de test rouge sur la branche.

---

## Tâche 1 — Données et pipeline (schéma, validation, chargement, types, paquet)

**Files :**
- Create : `schemas/glossaire.schema.json`, `data/glossaire.json`, `scripts/lib/glossaire.ts`, `scripts/glossaire.test.ts`
- Modify : `schemas/journal.schema.json`, `scripts/lib/dataset.ts`, `scripts/lib/validate.ts`, `scripts/validate.ts`, `scripts/lib/jeu-synthetique.ts`, `scripts/bundle.ts`, `app/paquet.ts`
- Regenerate : `core/types.generated.ts`, `app/donnees/paquet.json`
- Test : `scripts/validate.test.ts`, `scripts/glossaire.test.ts`

**Interfaces :**
- Consumes : `chargerDataset(racine: string): Dataset`, `validerDataset(ds: Dataset): Rapport`, `erreursDeSchema(nom, valeur)`, `construirePaquet()`.
- Produces :
  - type généré `Glossaire.FichierGlossaire = Glossaire.EntreeGlossaire[]` avec `interface EntreeGlossaire { sigle: string; developpe: string; explication: string; formes?: string[] }` ;
  - `Dataset.glossaire: Glossaire.FichierGlossaire` (hors empreinte) ;
  - règles d'erreur `schema`, `sigle-glossaire-reutilise`, `forme-glossaire-reutilisee`, `explication-glossaire-trop-longue` ; constante `MOTS_EXPLICATION_GLOSSAIRE_MAX = 25` ; statistique `sigles_glossaire` ;
  - `paquetGlossaire(entrees: readonly Glossaire.EntreeGlossaire[]): Glossaire.EntreeGlossaire[]` ;
  - `Paquet.glossaire: Glossaire.EntreeGlossaire[]` (clé `glossaire` de `app/donnees/paquet.json`, triée).

**Palier d'exécution suggéré :** `implementer` (Sonnet) — une dizaine de fichiers du pipeline à toucher de façon cohérente, avec régénération ; code entièrement fourni, mais l'ordre des commandes et la lecture des échecs comptent.

- [ ] **Étape 1.1 — Écrire les tests qui échouent (validation et empreinte).** Dans `scripts/validate.test.ts`, remplacer les deux premières lignes d'import :

```ts
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
```

par :

```ts
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
```

puis ajouter à la fin du fichier :

```ts
describe('glossaire', () => {
  const entree = (sigle: string, explication = 'Une phrase courte.', formes?: string[]) => ({
    sigle,
    developpe: `${sigle} en toutes lettres`,
    explication,
    ...(formes ? { formes } : {}),
  });

  it('données réelles : le glossaire est chargé et non vide', () => {
    expect(reel.glossaire.length).toBeGreaterThan(0);
  });
  it('schéma : propriété inconnue refusée', () => {
    const ds = copie(jeuSynthetique());
    ds.glossaire[0].source = 'https://exemple.fr';
    expect(regles(ds)).toContain('schema');
  });
  it('schéma : sigle qui ne commence pas par deux majuscules ou chiffres refusé', () => {
    const ds = copie(jeuSynthetique());
    ds.glossaire[0].sigle = 'Ue';
    expect(regles(ds)).toContain('schema');
  });
  it('sigle défini deux fois', () => {
    const ds = copie(jeuSynthetique());
    ds.glossaire.push(entree('UE'));
    expect(regles(ds)).toContain('sigle-glossaire-reutilise');
  });
  it('écriture reconnue pour deux sigles', () => {
    const ds = copie(jeuSynthetique());
    ds.glossaire.push(entree('UEM', 'Une phrase courte.', ['UE']));
    expect(regles(ds)).toContain('forme-glossaire-reutilisee');
  });
  it('explication de plus de 25 mots', () => {
    const ds = copie(jeuSynthetique());
    ds.glossaire[0].explication = Array.from({ length: 26 }, () => 'mot').join(' ');
    expect(regles(ds)).toContain('explication-glossaire-trop-longue');
  });
  it('explication de 25 mots acceptée', () => {
    const ds = copie(jeuSynthetique());
    ds.glossaire[0].explication = Array.from({ length: 25 }, () => 'mot').join(' ');
    expect(regles(ds)).toEqual([]);
  });
  it('n’entre pas dans l’empreinte : le modifier ne rend pas derive/ obsolète', () => {
    const dossier = mkdtempSync(join(tmpdir(), 'glossaire-'));
    try {
      cpSync(join(racine, 'data'), join(dossier, 'data'), { recursive: true });
      writeFileSync(join(dossier, 'data', 'glossaire.json'), `${JSON.stringify([entree('ZZZ')], null, 2)}\n`);
      expect(chargerDataset(dossier).empreinte).toBe(reel.empreinte);
    } finally {
      rmSync(dossier, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Étape 1.2 — Écrire le test du tri pour le paquet.** Créer `scripts/glossaire.test.ts` :

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { chargerDataset } from './lib/dataset.ts';
import { paquetGlossaire } from './lib/glossaire.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const e = (sigle: string, formes?: string[]) => ({
  sigle,
  developpe: `${sigle} en toutes lettres`,
  explication: 'Une phrase courte.',
  ...(formes ? { formes } : {}),
});

describe('paquetGlossaire', () => {
  it('trie par ordre alphabétique français (une lettre accentuée au rang de sa lettre de base)', () => {
    expect(paquetGlossaire([e('UE'), e('ÉTA'), e('ZAN'), e('EDF')]).map((x) => x.sigle)).toEqual(['EDF', 'ÉTA', 'UE', 'ZAN']);
  });
  it('range les chiffres avant les lettres', () => {
    expect(paquetGlossaire([e('CEDH'), e('CE2'), e('CE1')]).map((x) => x.sigle)).toEqual(['CE1', 'CE2', 'CEDH']);
  });
  it('garde les formes, et n’ajoute pas de clé formes absente', () => {
    const [avec, sans] = paquetGlossaire([e('LBD', ['LBD40']), e('PIB')]);
    expect(avec).toEqual(e('LBD', ['LBD40']));
    expect(sans).toEqual(e('PIB'));
    expect('formes' in sans!).toBe(false);
  });
  it('ne modifie pas le tableau reçu', () => {
    const entrees = [e('UE'), e('EDF')];
    paquetGlossaire(entrees);
    expect(entrees.map((x) => x.sigle)).toEqual(['UE', 'EDF']);
  });
  it('le paquet de l’application contient le glossaire trié (sinon : npm run bundle)', () => {
    const paquet = JSON.parse(readFileSync(join(racine, 'app', 'donnees', 'paquet.json'), 'utf8'));
    expect(paquet.glossaire).toEqual(paquetGlossaire(chargerDataset(racine).glossaire));
  });
});
```

- [ ] **Étape 1.3 — Lancer les tests et constater l'échec attendu.**

```bash
npx vitest run scripts/validate.test.ts scripts/glossaire.test.ts
```

Attendu : `scripts/glossaire.test.ts` échoue au chargement (module `./lib/glossaire.ts` introuvable) ; dans `scripts/validate.test.ts`, les 8 tests du bloc `glossaire` échouent (`Cannot read properties of undefined`, sur `length`, `0` ou `push`) ; les autres tests restent verts.

- [ ] **Étape 1.4 — Créer le schéma.** Créer `schemas/glossaire.schema.json` :

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "FichierGlossaire",
  "description": "data/glossaire.json — glossaire des sigles affichés dans l'application (issue #7). Une entrée par sigle, sans nom de personne. N'entre pas dans l'empreinte des données : le glossaire n'a aucun effet sur les scores.",
  "type": "array",
  "minItems": 1,
  "items": { "$ref": "#/$defs/entree" },
  "$defs": {
    "entree": {
      "title": "EntreeGlossaire",
      "type": "object",
      "additionalProperties": false,
      "required": ["sigle", "developpe", "explication"],
      "properties": {
        "sigle": {
          "description": "Le sigle tel qu'il s'écrit dans les textes : majuscule initiale, puis au moins une majuscule ou un chiffre. Unique.",
          "type": "string",
          "pattern": "^\\p{Lu}[\\p{Lu}\\p{N}]+$"
        },
        "developpe": { "description": "Forme développée exacte (nom officiel).", "type": "string", "minLength": 1 },
        "explication": { "description": "Une phrase factuelle et neutre, 25 mots au plus (contrôlé par scripts/lib/validate.ts).", "type": "string", "minLength": 1 },
        "formes": {
          "description": "Autres écritures à reconnaître dans les textes (casse, variante chiffrée). Chacune n'appartient qu'à une entrée.",
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": { "type": "string", "pattern": "^\\p{L}[\\p{L}\\p{N}]+$" }
        }
      }
    }
  }
}
```

(Vérifié à la rédaction du plan : Ajv 2020 en mode strict compile ce schéma, les motifs `\p{…}` sont acceptés — Ajv les compile avec le drapeau `u` —, `TVA` et `ÉTAT` passent, `Tva` et une propriété inconnue sont refusés.)

Dans `schemas/journal.schema.json`, remplacer :

```json
              "ajout_impact"
```

par :

```json
              "ajout_impact",
              "ajout_glossaire"
```

- [ ] **Étape 1.5 — Créer les données de départ.** Créer `data/glossaire.json` (4 entrées valides ; le contenu complet arrive en T6) :

```json
[
  {
    "sigle": "OTAN",
    "developpe": "Organisation du traité de l'Atlantique Nord",
    "explication": "Alliance militaire fondée en 1949 entre des pays d'Amérique du Nord et d'Europe, qui s'engagent à se défendre mutuellement."
  },
  {
    "sigle": "PIB",
    "developpe": "Produit intérieur brut",
    "explication": "Valeur de ce qui est produit dans un pays en un an ; il sert à mesurer la taille d'une économie."
  },
  {
    "sigle": "TVA",
    "developpe": "Taxe sur la valeur ajoutée",
    "explication": "Impôt sur la consommation, compris dans le prix payé par l'acheteur ; son taux normal est de 20 % en France."
  },
  {
    "sigle": "UE",
    "developpe": "Union européenne",
    "explication": "Union politique et économique de 27 États européens, dotée d'institutions et d'un marché communs."
  }
]
```

- [ ] **Étape 1.6 — Charger le glossaire, hors empreinte.** Dans `scripts/lib/dataset.ts` :

Remplacer la ligne d'import des types par :

```ts
import type { Axes, Candidats, Glossaire, Journal, Positions, Questions } from '../../core/types.generated.ts';
```

Ajouter après `type FichierQuestions = Questions.FichierQuestions;` :

```ts
type FichierGlossaire = Glossaire.FichierGlossaire;
```

Dans l'interface `Dataset`, remplacer :

```ts
  journal: FichierJournal;
  /**
   * Empreinte SHA-256 des fichiers qui alimentent les calculs (candidats, axes, questions, positions).
   * Le journal n'en fait pas partie : y ajouter une ligne ne doit pas invalider derive/.
   */
```

par :

```ts
  journal: FichierJournal;
  /** Glossaire des sigles (issue #7). Hors empreinte, comme le journal : il n'a aucun effet sur les scores. */
  glossaire: FichierGlossaire;
  /**
   * Empreinte SHA-256 des fichiers qui alimentent les calculs (candidats, axes, questions, positions).
   * Le journal et le glossaire n'en font pas partie : les modifier ne doit pas invalider derive/.
   */
```

Dans `chargerDataset`, remplacer :

```ts
  const { valeur: journal } = lireJson<FichierJournal>(join(data, 'journal.json'), racine);

  return { axes, candidats, questions, positions, journal, empreinte: hash.digest('hex') };
```

par :

```ts
  const { valeur: journal } = lireJson<FichierJournal>(join(data, 'journal.json'), racine);
  const { valeur: glossaire } = lireJson<FichierGlossaire>(join(data, 'glossaire.json'), racine);

  return { axes, candidats, questions, positions, journal, glossaire, empreinte: hash.digest('hex') };
```

- [ ] **Étape 1.7 — Valider le glossaire.** Dans `scripts/lib/validate.ts` :

Dans la liste `noms` de `validateurs()`, remplacer `    'journal',` par :

```ts
    'journal',
    'glossaire',
```

Après `export const MOTS_CITATION_MAX = 14;`, ajouter :

```ts

/** Nombre maximal de mots de l'explication d'un sigle du glossaire (spécification du glossaire, § 3.1). */
export const MOTS_EXPLICATION_GLOSSAIRE_MAX = 25;
```

Dans le commentaire de `validerDataset`, remplacer :

```ts
 *  - toute violation d'un schéma, tout renvoi vers un objet inexistant, toute incohérence entre un code et ses codeurs.
```

par :

```ts
 *  - toute violation d'un schéma, tout renvoi vers un objet inexistant, toute incohérence entre un code et ses codeurs ;
 *  - au glossaire : un sigle défini deux fois, une écriture reconnue pour deux sigles, une explication de plus de 25 mots.
```

Après `  schemas('journal', ds.journal, 'data/journal.json');`, ajouter :

```ts
  schemas('glossaire', ds.glossaire, 'data/glossaire.json');
```

Juste avant `  const erreurs = problemes.filter((p) => p.niveau === 'erreur');`, ajouter :

```ts
  // 6. Glossaire (issue #7) : un sigle par entrée, chaque écriture reconnue pour un seul sigle, explications courtes.
  const glossaire = (Array.isArray(ds.glossaire) ? ds.glossaire : []).filter((e) => e && typeof e.sigle === 'string');
  const siglesVus = new Set<string>();
  const sigleDeForme = new Map<string, string>();
  for (const e of glossaire) {
    if (siglesVus.has(e.sigle)) erreur('sigle-glossaire-reutilise', 'data/glossaire.json', `sigle « ${e.sigle} » défini deux fois`);
    siglesVus.add(e.sigle);
    for (const forme of [e.sigle, ...(e.formes ?? [])]) {
      const deja = sigleDeForme.get(forme);
      if (deja !== undefined && deja !== e.sigle) {
        erreur('forme-glossaire-reutilisee', 'data/glossaire.json', `« ${forme} » serait reconnu à la fois pour ${deja} et pour ${e.sigle}`);
      } else {
        sigleDeForme.set(forme, e.sigle);
      }
    }
    if (typeof e.explication === 'string' && compterMots(e.explication) > MOTS_EXPLICATION_GLOSSAIRE_MAX) {
      erreur(
        'explication-glossaire-trop-longue',
        'data/glossaire.json',
        `${e.sigle} : explication de ${compterMots(e.explication)} mots (maximum ${MOTS_EXPLICATION_GLOSSAIRE_MAX})`,
      );
    }
  }

```

Dans l'objet `statistiques`, remplacer `      codes_publies: nbCodesPublies,` par :

```ts
      codes_publies: nbCodesPublies,
      sigles_glossaire: glossaire.length,
```

Dans `scripts/validate.ts`, remplacer :

```ts
    `${s.fichiers_positions} fichiers de positions · ${s.positions} positions · ${s.codes_publies} codes publiés`,
```

par :

```ts
    `${s.fichiers_positions} fichiers de positions · ${s.positions} positions · ${s.codes_publies} codes publiés · ` +
    `${s.sigles_glossaire} sigles au glossaire`,
```

- [ ] **Étape 1.8 — Jeu synthétique valide.** Dans `scripts/lib/jeu-synthetique.ts`, remplacer :

```ts
    journal: { _note: '', entrees: [] },
```

par :

```ts
    journal: { _note: '', entrees: [] },
    glossaire: [{ sigle: 'UE', developpe: 'Union européenne', explication: 'Union politique et économique de 27 États européens.' }],
```

- [ ] **Étape 1.9 — Tri pour le paquet.** Créer `scripts/lib/glossaire.ts` :

```ts
/** Glossaire des sigles dans le paquet de l'application (issue #7). */
import type { Glossaire } from '../../core/types.generated.ts';

/**
 * Entrées du glossaire telles que les lit l'application : ordre alphabétique français (une lettre accentuée au
 * rang de sa lettre de base, les chiffres avant les lettres), champs dans un ordre stable, `formes` seulement s'il y en a.
 */
export function paquetGlossaire(entrees: readonly Glossaire.EntreeGlossaire[]): Glossaire.EntreeGlossaire[] {
  return [...entrees]
    .sort((a, b) => a.sigle.localeCompare(b.sigle, 'fr'))
    .map((e) => ({
      sigle: e.sigle,
      developpe: e.developpe,
      explication: e.explication,
      ...(e.formes ? { formes: [...e.formes] } : {}),
    }));
}
```

- [ ] **Étape 1.10 — Brancher le paquet.** Dans `scripts/bundle.ts` :

Remplacer :

```ts
 * Le paquet ne contient que ce que le quiz et les résultats affichent : questions actives, candidats,
 * positions publiées avec tous leurs extraits et leurs sources, et les fichiers de derive/ nécessaires
 * au tirage. Les justifications des codeurs et les textes anonymisés restent consultables dans le dépôt.
```

par :

```ts
 * Le paquet ne contient que ce que le quiz et les résultats affichent : questions actives, candidats,
 * positions publiées avec tous leurs extraits et leurs sources, les fichiers de derive/ nécessaires
 * au tirage et le glossaire des sigles. Les justifications des codeurs et les textes anonymisés restent
 * consultables dans le dépôt.
```

Après `import { chargerDataset } from './lib/dataset.ts';`, ajouter :

```ts
import { paquetGlossaire } from './lib/glossaire.ts';
```

Dans l'objet renvoyé par `construirePaquet()`, remplacer :

```ts
    discriminance,
    ancrage,
  };
}
```

par :

```ts
    discriminance,
    ancrage,
    glossaire: paquetGlossaire(ds.glossaire),
  };
}
```

Dans `app/paquet.ts`, remplacer :

```ts
import type { DeriveAncrage, DeriveDiscriminance, Questions } from '../core/types.generated.ts';
```

par :

```ts
import type { DeriveAncrage, DeriveDiscriminance, Glossaire, Questions } from '../core/types.generated.ts';
```

et, dans `interface Paquet`, remplacer :

```ts
  ancrage: DeriveAncrage.DeriveAncrage;
}
```

par :

```ts
  ancrage: DeriveAncrage.DeriveAncrage;
  /** Glossaire des sigles, par ordre alphabétique français (scripts/lib/glossaire.ts). */
  glossaire: Glossaire.EntreeGlossaire[];
}
```

- [ ] **Étape 1.11 — Régénérer types et paquet, relancer les tests.**

```bash
npm run types:generate
npm run data:validate
npm run bundle
npx vitest run scripts/validate.test.ts scripts/glossaire.test.ts
```

Attendu :
- `core/types.generated.ts écrit (…)` ; `git diff core/types.generated.ts` montre un nouvel espace de noms `export namespace Glossaire {` (entre `DeriveRapportNeutralite` et `Journal`) contenant `export type FichierGlossaire = EntreeGlossaire[];` et `export interface EntreeGlossaire` aux champs `sigle: string; developpe: string; explication: string; formes?: string[];` (sortie vérifiée à la rédaction du plan avec les options de `scripts/generate-types.ts`), et `| 'ajout_glossaire'` dans le type du journal.
- `data:validate` affiche `… codes publiés · 4 sigles au glossaire` puis `OK : données valides (…)`.
- `app/donnees/paquet.json écrit (…)`.
- Tous les tests des deux fichiers passent.

- [ ] **Étape 1.12 — Vérification complète et absence d'effet sur derive/.**

```bash
npm run derive && npm run bundle && npm run check
git status --short derive/
```

Attendu : `npm run check` vert de bout en bout (validation, `derive:check`, `bundle:check`, `types:check`, `typecheck`, 24 fichiers de test, `vite build`) ; `git status --short derive/` n'affiche rien (le glossaire est hors empreinte).

- [ ] **Étape 1.13 — Commit** (via `git-ops`) :

```bash
git add schemas/glossaire.schema.json schemas/journal.schema.json data/glossaire.json scripts/lib/dataset.ts scripts/lib/validate.ts scripts/validate.ts scripts/lib/jeu-synthetique.ts scripts/lib/glossaire.ts scripts/glossaire.test.ts scripts/validate.test.ts scripts/bundle.ts app/paquet.ts core/types.generated.ts app/donnees/paquet.json
git commit -m "feat(glossaire): ajouter les données et le schéma du glossaire" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

---

## Tâche 2 — `segmenter` et `extraireSigles` (core, purs)

**Files :**
- Create : `core/glossaire/segmenter.ts`, `core/glossaire/inventaire.ts`, `core/glossaire/index.ts`
- Modify : `core/README.md`
- Test : `core/glossaire/segmenter.test.ts`, `core/glossaire/inventaire.test.ts`

**Interfaces :**
- Consumes : rien (aucune dépendance au DOM ni au paquet).
- Produces :
  - `interface EntreeASegmenter { sigle: string; formes?: readonly string[] }`
  - `interface IndexGlossaire { motif: RegExp | null; sigleDeForme: ReadonlyMap<string, string> }`
  - `type Segment = { type: 'texte'; texte: string } | { type: 'sigle'; texte: string; sigle: string; premiere: boolean }`
  - `indexer(entrees: readonly EntreeASegmenter[]): IndexGlossaire`
  - `segmenter(texte: string, index: IndexGlossaire): Segment[]`
  - `extraireSigles(texte: string): string[]`

**Palier d'exécution suggéré :** `implementer-light` (Haiku) — deux fonctions pures, code et tests intégralement fournis et déjà vérifiés à la rédaction du plan (comportement des bornes Unicode contrôlé sur Node 24).

- [ ] **Étape 2.1 — Écrire les tests de `segmenter` (échec attendu).** Créer `core/glossaire/segmenter.test.ts` :

```ts
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { indexer, segmenter, type Segment } from './index.ts';

const index = indexer([
  { sigle: 'PLF' },
  { sigle: 'PLFSS' },
  { sigle: 'UE' },
  { sigle: 'AN' },
  { sigle: 'OTAN' },
  { sigle: 'TVA' },
  { sigle: 'CESEDA', formes: ['Ceseda'] },
  { sigle: 'EPR' },
  { sigle: 'LBD', formes: ['LBD40'] },
]);
const sigles = (segments: Segment[]): string[] => segments.flatMap((s) => (s.type === 'sigle' ? [s.texte] : []));

describe('segmenter : cas limites', () => {
  it('texte vide : aucun segment', () => {
    expect(segmenter('', index)).toEqual([]);
  });
  it('glossaire vide : un seul segment de texte', () => {
    expect(segmenter('La TVA', indexer([]))).toEqual([{ type: 'texte', texte: 'La TVA' }]);
  });
  it('sigle seul (début et fin de texte confondus)', () => {
    expect(segmenter('TVA', index)).toEqual([{ type: 'sigle', texte: 'TVA', sigle: 'TVA', premiere: true }]);
  });
  it('sigles en début et en fin de texte', () => {
    expect(segmenter('TVA et UE', index)).toEqual([
      { type: 'sigle', texte: 'TVA', sigle: 'TVA', premiere: true },
      { type: 'texte', texte: ' et ' },
      { type: 'sigle', texte: 'UE', sigle: 'UE', premiere: true },
    ]);
  });
  it('accents et chiffres autour, hors du sigle', () => {
    expect(segmenter('Hausse de TVA à 20 %', index)).toEqual([
      { type: 'texte', texte: 'Hausse de ' },
      { type: 'sigle', texte: 'TVA', sigle: 'TVA', premiere: true },
      { type: 'texte', texte: ' à 20 %' },
    ]);
  });
});

describe('segmenter : bornes', () => {
  it.each(['(TVA)', 'TVA,', 'TVA.', 'TVA;', '« TVA »', '« TVA »', 'TVA\n'])('collé à la ponctuation : %j', (texte) => {
    expect(sigles(segmenter(texte, index))).toEqual(['TVA']);
  });
  it.each([['TVA/UE'], ['TVA-UE'], ['TVA\nUE']])('deux sigles séparés par un signe : %j', (texte) => {
    expect(sigles(segmenter(texte, index))).toEqual(['TVA', 'UE']);
  });
  it('apostrophe droite et apostrophe typographique', () => {
    expect(segmenter('l’OTAN', index)).toEqual([
      { type: 'texte', texte: 'l’' },
      { type: 'sigle', texte: 'OTAN', sigle: 'OTAN', premiere: true },
    ]);
    expect(sigles(segmenter("l'OTAN", index))).toEqual(['OTAN']);
    expect(sigles(segmenter('d’UE', index))).toEqual(['UE']);
  });
  it.each(['UEFA', 'QUEUE', 'ANNÉE', 'PLANS', 'EPR2', '2TVA', 'TVAs', 'éUE', 'UEé'])(
    'sigle contenu dans un mot plus long, ou collé à une lettre ou un chiffre : rien (%j)',
    (texte) => {
      expect(sigles(segmenter(texte, index))).toEqual([]);
    },
  );
  it('casse exacte : « tva », « Tva », « uE » ne sont pas reconnus', () => {
    expect(sigles(segmenter('tva, Tva, uE', index))).toEqual([]);
  });
});

describe('segmenter : formes', () => {
  it('la forme la plus longue d’abord', () => {
    expect(segmenter('Le PLFSS et le PLF', index).filter((s) => s.type === 'sigle')).toEqual([
      { type: 'sigle', texte: 'PLFSS', sigle: 'PLFSS', premiere: true },
      { type: 'sigle', texte: 'PLF', sigle: 'PLF', premiere: true },
    ]);
  });
  it('une variante est rattachée à son sigle, et compte comme lui pour la première occurrence', () => {
    expect(segmenter('Le Ceseda (CESEDA) et le LBD40', index)).toEqual([
      { type: 'texte', texte: 'Le ' },
      { type: 'sigle', texte: 'Ceseda', sigle: 'CESEDA', premiere: true },
      { type: 'texte', texte: ' (' },
      { type: 'sigle', texte: 'CESEDA', sigle: 'CESEDA', premiere: false },
      { type: 'texte', texte: ') et le ' },
      { type: 'sigle', texte: 'LBD40', sigle: 'LBD', premiere: true },
    ]);
  });
  it('les caractères spéciaux d’une forme sont pris littéralement', () => {
    const special = indexer([{ sigle: 'A.B' }]);
    expect(segmenter('AxB', special)).toEqual([{ type: 'texte', texte: 'AxB' }]);
    expect(sigles(segmenter('A.B', special))).toEqual(['A.B']);
  });
});

describe('segmenter : première occurrence', () => {
  it('vrai à la première occurrence de chaque sigle seulement', () => {
    const premieres = segmenter('TVA, UE, TVA, UE, OTAN', index).flatMap((s) => (s.type === 'sigle' ? [s.premiere] : []));
    expect(premieres).toEqual([true, true, false, false, true]);
  });
  it('chaque appel repart de zéro', () => {
    expect(segmenter('TVA', index)).toEqual(segmenter('TVA', index));
    expect(segmenter('TVA', index)[0]).toMatchObject({ premiere: true });
  });
});

describe('segmenter : propriétés', () => {
  const morceaux = fc.constantFrom('TVA', 'UE', 'PLF', 'PLFSS', 'Ceseda', 'LBD40', 'l’', "l'", 'a', 'É', 'é', ' ', ' ', '2', ',', '(', ')');
  const textes = fc.array(morceaux, { maxLength: 30 }).map((m) => m.join(''));

  it('les segments recollés redonnent le texte, sans segment de texte vide', () => {
    fc.assert(
      fc.property(textes, (texte) => {
        const s = segmenter(texte, index);
        expect(s.map((x) => x.texte).join('')).toBe(texte);
        expect(s.some((x) => x.type === 'texte' && x.texte === '')).toBe(false);
      }),
    );
  });
  it('tout segment « sigle » désigne une entrée du glossaire, et un seul est « premier » par sigle', () => {
    fc.assert(
      fc.property(textes, (texte) => {
        const s = segmenter(texte, index).filter((x) => x.type === 'sigle');
        for (const x of s) expect(index.sigleDeForme.get(x.texte)).toBe(x.sigle);
        const premiers = s.filter((x) => x.premiere).map((x) => x.sigle);
        expect(new Set(premiers).size).toBe(premiers.length);
        expect(new Set(premiers)).toEqual(new Set(s.map((x) => x.sigle)));
      }),
    );
  });
});
```

- [ ] **Étape 2.2 — Écrire les tests d'`extraireSigles` (échec attendu).** Créer `core/glossaire/inventaire.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { extraireSigles } from './index.ts';

describe('extraireSigles', () => {
  it('relève les mots d’au moins deux majuscules, chiffres compris', () => {
    expect(extraireSigles('La TVA et l’OTAN, le CO2 et le CE1')).toEqual(['TVA', 'OTAN', 'CO2', 'CE1']);
  });
  it('ignore les mots d’une seule majuscule (articles de loi, numéros, noms propres)', () => {
    expect(extraireSigles('Article L136 ou D1, A69 et Paris')).toEqual([]);
  });
  it('relève les capitales accentuées', () => {
    expect(extraireSigles('VALIDÉ le 3 octobre')).toEqual(['VALIDÉ']);
  });
  it('ignore un mot en capitales collé à une minuscule', () => {
    expect(extraireSigles('des PMEs')).toEqual([]);
  });
  it('garde chaque occurrence, dans l’ordre', () => {
    expect(extraireSigles('TVA puis SP95-E10 puis TVA')).toEqual(['TVA', 'SP95', 'TVA']);
  });
  it('texte vide : rien', () => {
    expect(extraireSigles('')).toEqual([]);
  });
});
```

- [ ] **Étape 2.3 — Lancer et constater l'échec.**

```bash
npx vitest run core/glossaire
```

Attendu : les deux fichiers échouent au chargement (`./index.ts` introuvable).

- [ ] **Étape 2.4 — Implémenter `segmenter`.** Créer `core/glossaire/segmenter.ts` :

```ts
/**
 * Découpage d'un texte en segments « texte » et « sigle » (issue #7). Fonction pure, sans DOM : l'interface
 * (app/glossaire/Texte.tsx) rend chaque segment « sigle » comme un bouton.
 *
 * Correspondance exacte, sensible à la casse, sur mots entiers : un sigle n'est reconnu que s'il n'est ni précédé
 * ni suivi d'une lettre ou d'un chiffre (« UE » n'est pas reconnu dans « UEFA », ni « EPR » dans « EPR2 »).
 * L'apostrophe, droite ou typographique, n'est ni une lettre ni un chiffre : « l’OTAN » est reconnu.
 */

/** Ce que le découpage lit d'une entrée du glossaire. */
export interface EntreeASegmenter {
  sigle: string;
  /** Autres écritures reconnues pour ce sigle (casse, variante chiffrée). */
  formes?: readonly string[];
}

/** Index construit une fois pour tout le glossaire (indexer), puis réutilisé à chaque appel de segmenter. */
export interface IndexGlossaire {
  /** Toutes les écritures, la plus longue d'abord ; null si le glossaire est vide. */
  motif: RegExp | null;
  /** Écriture reconnue → sigle de son entrée. */
  sigleDeForme: ReadonlyMap<string, string>;
}

export type Segment =
  | { type: 'texte'; texte: string }
  /** `premiere` : première occurrence de ce sigle dans le texte découpé (toutes écritures confondues). */
  | { type: 'sigle'; texte: string; sigle: string; premiere: boolean };

const echapper = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function indexer(entrees: readonly EntreeASegmenter[]): IndexGlossaire {
  const sigleDeForme = new Map<string, string>();
  for (const e of entrees) {
    for (const forme of [e.sigle, ...(e.formes ?? [])]) if (!sigleDeForme.has(forme)) sigleDeForme.set(forme, e.sigle);
  }
  // La plus longue d'abord (« PLFSS » avant « PLF ») ; à longueur égale, ordre stable.
  const formes = [...sigleDeForme.keys()].sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0));
  const motif =
    formes.length === 0 ? null : new RegExp(`(?<![\\p{L}\\p{N}])(?:${formes.map(echapper).join('|')})(?![\\p{L}\\p{N}])`, 'gu');
  return { motif, sigleDeForme };
}

export function segmenter(texte: string, index: IndexGlossaire): Segment[] {
  if (texte === '') return [];
  if (!index.motif) return [{ type: 'texte', texte }];
  const segments: Segment[] = [];
  const vus = new Set<string>();
  let curseur = 0;
  for (const m of texte.matchAll(index.motif)) {
    const debut = m.index;
    if (debut > curseur) segments.push({ type: 'texte', texte: texte.slice(curseur, debut) });
    const sigle = index.sigleDeForme.get(m[0])!;
    segments.push({ type: 'sigle', texte: m[0], sigle, premiere: !vus.has(sigle) });
    vus.add(sigle);
    curseur = debut + m[0].length;
  }
  if (curseur < texte.length) segments.push({ type: 'texte', texte: texte.slice(curseur) });
  return segments;
}
```

- [ ] **Étape 2.5 — Implémenter `extraireSigles` et l'API.** Créer `core/glossaire/inventaire.ts` :

```ts
/**
 * Mots en capitales d'un texte (issue #7) : au moins deux majuscules, chiffres admis, mot entier. Sert à
 * l'inventaire des sigles (scripts/inventaire-glossaire.ts) et au test d'exhaustivité (app/glossaire.test.ts).
 */
const MOT_EN_CAPITALES = /(?<![\p{L}\p{N}])\p{Lu}[\p{Lu}\p{N}]+(?![\p{L}\p{N}])/gu;

export function extraireSigles(texte: string): string[] {
  return [...texte.matchAll(MOT_EN_CAPITALES)].map((m) => m[0]).filter((mot) => (mot.match(/\p{Lu}/gu) ?? []).length >= 2);
}
```

Créer `core/glossaire/index.ts` :

```ts
/** Glossaire des sigles : API publique (issue #7). */
export { indexer, segmenter } from './segmenter.ts';
export type { EntreeASegmenter, IndexGlossaire, Segment } from './segmenter.ts';
export { extraireSigles } from './inventaire.ts';
```

Dans `core/README.md`, remplacer :

```markdown
| `core/duel/` | 5h | mode Duel : réservoir d'un candidat, tirage, affinité, rapport de neutralité |
```

par :

```markdown
| `core/duel/` | 5h | mode Duel : réservoir d'un candidat, tirage, affinité, rapport de neutralité |
| `core/glossaire/` | issue #7 | découpage des textes en sigles, relevé des mots en capitales |
```

- [ ] **Étape 2.6 — Relancer.**

```bash
npx vitest run core/glossaire && npm run typecheck
```

Attendu : tous les tests de `core/glossaire` passent (cas limites, bornes, formes, première occurrence, propriétés, `extraireSigles`) ; `tsc -b` sans erreur.

- [ ] **Étape 2.7 — Commit** (via `git-ops`) :

```bash
git add core/glossaire core/README.md
git commit -m "feat(glossaire): découper les textes en sigles" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

---

## Tâche 3 — État du glossaire (réducteur pur) et `GlossaireProvider`

**Files :**
- Create : `app/glossaire/etat.ts`, `app/glossaire/donnees.ts`, `app/glossaire/GlossaireProvider.tsx`
- Modify : `tsconfig.node.json`
- Test : `app/glossaire/etat.test.ts`

**Interfaces :**
- Consumes : `paquet.glossaire` (T1), `indexer` (T2).
- Produces :
  - `interface EtatGlossaire { ouvert: boolean; entree: string | null; demande: number }`
  - `type ActionGlossaire = { type: 'ouvrir'; sigle: string } | { type: 'fermer' } | { type: 'basculer' }`
  - `const ETAT_INITIAL: EtatGlossaire`
  - `reduireGlossaire(connus: ReadonlySet<string>, etat: EtatGlossaire, action: ActionGlossaire): EtatGlossaire`
  - `idAncre(sigle: string): string` (`glossaire-<sigle>`) ; `comportementDefilement(reduit: boolean): 'auto' | 'smooth'`
  - `ENTREES: ReadonlyMap<string, Glossaire.EntreeGlossaire>` ; `INDEX: IndexGlossaire` (`app/glossaire/donnees.ts`)
  - `GlossaireProvider({ children }: { children: ReactNode })` ; `useGlossaire(): ValeurGlossaire` avec `interface ValeurGlossaire { etat: EtatGlossaire; ouvrir(sigle: string, declencheur: HTMLElement | null): void; fermer(): void; basculer(declencheur: HTMLElement | null): void }`

**Palier d'exécution suggéré :** `implementer-light` (Haiku) — réducteur et fournisseur entièrement fournis ; aucune décision de conception restante.

- [ ] **Étape 3.1 — Écrire les tests du réducteur (échec attendu).** Créer `app/glossaire/etat.test.ts` :

```ts
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { comportementDefilement, ETAT_INITIAL, idAncre, reduireGlossaire, type ActionGlossaire, type EtatGlossaire } from './etat.ts';

const connus = new Set(['TVA', 'UE']);
const r = (etat: EtatGlossaire, action: ActionGlossaire): EtatGlossaire => reduireGlossaire(connus, etat, action);
const suite = (...actions: ActionGlossaire[]): EtatGlossaire => actions.reduce(r, ETAT_INITIAL);
const ouvrir = (sigle: string): ActionGlossaire => ({ type: 'ouvrir', sigle });
const FERMER: ActionGlossaire = { type: 'fermer' };
const BASCULER: ActionGlossaire = { type: 'basculer' };

describe('reduireGlossaire', () => {
  it('fermé au départ', () => {
    expect(ETAT_INITIAL).toEqual({ ouvert: false, entree: null, demande: 0 });
  });
  it('ouvrir un sigle connu : ouvert sur son entrée', () => {
    expect(suite(ouvrir('TVA'))).toEqual({ ouvert: true, entree: 'TVA', demande: 1 });
  });
  it('ouvrir un sigle inconnu : ouvert, sans entrée mise en évidence', () => {
    expect(suite(ouvrir('XYZ'))).toEqual({ ouvert: true, entree: null, demande: 0 });
  });
  it('un sigle inconnu retire la mise en évidence précédente', () => {
    expect(suite(ouvrir('TVA'), ouvrir('XYZ'))).toEqual({ ouvert: true, entree: null, demande: 1 });
  });
  it('rouvrir le même sigle relance le défilement (demande incrémentée)', () => {
    expect(suite(ouvrir('TVA'), ouvrir('TVA'))).toEqual({ ouvert: true, entree: 'TVA', demande: 2 });
  });
  it('ouvrir un autre sigle, glossaire déjà ouvert : l’entrée change', () => {
    expect(suite(ouvrir('TVA'), ouvrir('UE'))).toEqual({ ouvert: true, entree: 'UE', demande: 2 });
  });
  it('fermer : plus d’entrée mise en évidence', () => {
    expect(suite(ouvrir('TVA'), FERMER)).toEqual({ ouvert: false, entree: null, demande: 1 });
  });
  it('fermer un glossaire fermé renvoie le même état (aucun rendu inutile)', () => {
    expect(r(ETAT_INITIAL, FERMER)).toBe(ETAT_INITIAL);
  });
  it('basculer : ouvre sans entrée, puis referme', () => {
    expect(suite(BASCULER)).toEqual({ ouvert: true, entree: null, demande: 0 });
    expect(suite(BASCULER, BASCULER)).toEqual({ ouvert: false, entree: null, demande: 0 });
    expect(suite(BASCULER, BASCULER, BASCULER)).toEqual({ ouvert: true, entree: null, demande: 0 });
  });
  it('basculer pendant une ouverture sur entrée : referme', () => {
    expect(suite(ouvrir('TVA'), BASCULER)).toEqual({ ouvert: false, entree: null, demande: 1 });
  });
  it('invariants, quelle que soit la suite d’actions', () => {
    const action = fc.oneof(
      fc.constantFrom('TVA', 'UE', 'XYZ', '').map(ouvrir),
      fc.constant(FERMER),
      fc.constant(BASCULER),
    );
    fc.assert(
      fc.property(fc.array(action, { maxLength: 40 }), (actions) => {
        let etat = ETAT_INITIAL;
        for (const a of actions) {
          const suivant = r(etat, a);
          expect(suivant.demande).toBeGreaterThanOrEqual(etat.demande);
          if (!suivant.ouvert) expect(suivant.entree).toBeNull();
          if (suivant.entree !== null) expect(connus.has(suivant.entree)).toBe(true);
          etat = suivant;
        }
      }),
    );
  });
});

describe('sélecteurs', () => {
  it('idAncre : identifiant d’ancre stable par sigle', () => {
    expect(idAncre('TVA')).toBe('glossaire-TVA');
    expect(idAncre('CE1')).toBe('glossaire-CE1');
  });
  it('comportementDefilement : instantané si les animations sont réduites, doux sinon', () => {
    expect(comportementDefilement(true)).toBe('auto');
    expect(comportementDefilement(false)).toBe('smooth');
  });
});
```

Dans `tsconfig.node.json`, ajouter les deux fichiers de `app/glossaire` lus par les tests à la liste `include`, en remplaçant :

```json
"app/jeu.test.ts", "app/donnees",
```

par :

```json
"app/jeu.test.ts", "app/glossaire/etat.ts", "app/glossaire/etat.test.ts", "app/donnees",
```

- [ ] **Étape 3.2 — Lancer et constater l'échec.**

```bash
npx vitest run app/glossaire/etat.test.ts
```

Attendu : échec au chargement (`./etat.ts` introuvable).

- [ ] **Étape 3.3 — Implémenter le réducteur.** Créer `app/glossaire/etat.ts` :

```ts
/**
 * État du glossaire (issue #7) : fonctions pures, testées sans navigateur (etat.test.ts). Sans DOM : ce fichier est
 * aussi vérifié par tsconfig.node.json.
 */
export interface EtatGlossaire {
  /** Panneau (ordinateur) ou feuille (téléphone) affiché. */
  ouvert: boolean;
  /** Sigle mis en évidence ; null à l'ouverture par le bouton « Glossaire » ou sur un sigle inconnu. */
  entree: string | null;
  /** Compteur des ouvertures sur une entrée : relance le défilement même quand l'entrée ne change pas. */
  demande: number;
}

export type ActionGlossaire = { type: 'ouvrir'; sigle: string } | { type: 'fermer' } | { type: 'basculer' };

export const ETAT_INITIAL: EtatGlossaire = { ouvert: false, entree: null, demande: 0 };

/** `connus` : les sigles du glossaire. Un sigle inconnu ouvre le glossaire sans rien mettre en évidence. */
export function reduireGlossaire(connus: ReadonlySet<string>, etat: EtatGlossaire, action: ActionGlossaire): EtatGlossaire {
  switch (action.type) {
    case 'ouvrir':
      return connus.has(action.sigle)
        ? { ouvert: true, entree: action.sigle, demande: etat.demande + 1 }
        : { ouvert: true, entree: null, demande: etat.demande };
    case 'fermer':
      return etat.ouvert ? { ouvert: false, entree: null, demande: etat.demande } : etat;
    case 'basculer':
      return { ouvert: !etat.ouvert, entree: null, demande: etat.demande };
  }
}

/** Identifiant d'ancre de l'entrée d'un sigle dans la liste du glossaire. */
export const idAncre = (sigle: string): string => `glossaire-${sigle}`;

/** Défilement vers l'entrée demandée : instantané si l'utilisateur a demandé moins d'animations. */
export const comportementDefilement = (reduit: boolean): 'auto' | 'smooth' => (reduit ? 'auto' : 'smooth');
```

- [ ] **Étape 3.4 — Relancer.**

```bash
npx vitest run app/glossaire/etat.test.ts
```

Attendu : 13 tests verts.

- [ ] **Étape 3.5 — Données partagées et fournisseur.** Créer `app/glossaire/donnees.ts` :

```ts
/** Glossaire du paquet, indexé une fois pour toute l'application (issue #7). */
import { indexer } from '../../core/glossaire/index.ts';
import type { Glossaire } from '../../core/types.generated.ts';
import { paquet } from '../paquet.ts';

export const ENTREES: ReadonlyMap<string, Glossaire.EntreeGlossaire> = new Map(paquet.glossaire.map((e) => [e.sigle, e]));
export const INDEX = indexer(paquet.glossaire);
```

Créer `app/glossaire/GlossaireProvider.tsx` :

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { ENTREES } from './donnees.ts';
import { ETAT_INITIAL, reduireGlossaire, type ActionGlossaire, type EtatGlossaire } from './etat.ts';

export interface ValeurGlossaire {
  etat: EtatGlossaire;
  /** Ouvre le glossaire sur un sigle ; `declencheur` reprend le focus à la fermeture. */
  ouvrir: (sigle: string, declencheur: HTMLElement | null) => void;
  fermer: () => void;
  /** Ouvre (sans entrée) ou ferme le glossaire : bouton « Glossaire ». */
  basculer: (declencheur: HTMLElement | null) => void;
}

const Contexte = createContext<ValeurGlossaire | null>(null);
const SIGLES: ReadonlySet<string> = new Set(ENTREES.keys());
const reducteur = (etat: EtatGlossaire, action: ActionGlossaire): EtatGlossaire => reduireGlossaire(SIGLES, etat, action);

/** État du glossaire pour toute l'application (branché dans App.tsx). */
export function GlossaireProvider({ children }: { children: ReactNode }) {
  const [etat, envoyer] = useReducer(reducteur, ETAT_INITIAL);
  // Élément qui a ouvert le glossaire : il reprend le focus à la fermeture (feuille modale surtout).
  const declencheur = useRef<HTMLElement | null>(null);
  const ouvert = useRef(etat.ouvert);
  useEffect(() => {
    if (ouvert.current && !etat.ouvert) {
      const element = declencheur.current;
      declencheur.current = null;
      if (element?.isConnected) element.focus();
    }
    ouvert.current = etat.ouvert;
  }, [etat.ouvert]);

  const memoriser = useCallback((element: HTMLElement | null) => {
    if (!ouvert.current) declencheur.current = element;
  }, []);
  const ouvrir = useCallback(
    (sigle: string, element: HTMLElement | null) => {
      memoriser(element);
      envoyer({ type: 'ouvrir', sigle });
    },
    [memoriser],
  );
  const fermer = useCallback(() => envoyer({ type: 'fermer' }), []);
  const basculer = useCallback(
    (element: HTMLElement | null) => {
      memoriser(element);
      envoyer({ type: 'basculer' });
    },
    [memoriser],
  );

  const valeur = useMemo(() => ({ etat, ouvrir, fermer, basculer }), [etat, ouvrir, fermer, basculer]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useGlossaire(): ValeurGlossaire {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useGlossaire doit être appelé sous GlossaireProvider');
  return valeur;
}
```

- [ ] **Étape 3.6 — Vérifier types et tests.**

```bash
npm run typecheck && npx vitest run app/glossaire core/glossaire
```

Attendu : `tsc -b` sans erreur ; 3 fichiers de test verts. (Le fournisseur n'est pas encore branché : il le sera en T4, avec ses tests Playwright.)

- [ ] **Étape 3.7 — Commit** (via `git-ops`) :

```bash
git add app/glossaire/etat.ts app/glossaire/etat.test.ts app/glossaire/donnees.ts app/glossaire/GlossaireProvider.tsx tsconfig.node.json
git commit -m "feat(glossaire): ajouter l'état et le fournisseur du glossaire" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

---

## Tâche 4 — Liste, panneau, feuille et bouton « Glossaire »

**Files :**
- Create : `app/glossaire/media.ts`, `app/glossaire/ListeGlossaire.tsx`, `app/glossaire/PanneauGlossaire.tsx`, `app/glossaire/FeuilleGlossaire.tsx`, `app/glossaire/CadreGlossaire.tsx`
- Modify : `app/App.tsx`, `app/index.css`
- Test : `e2e/glossaire.spec.ts` (création)

**Interfaces :**
- Consumes : `useGlossaire()`, `GlossaireProvider` (T3) ; `ENTREES` (T3) ; `idAncre`, `comportementDefilement` (T3) ; `paquet.glossaire` (T1).
- Produces :
  - `useMedia(requete: string): boolean`
  - `ListeGlossaire({ entree, demande, defiler }: { entree: string | null; demande: number; defiler: boolean })` : `<ul>` dont chaque `<li>` porte `id={idAncre(sigle)}` et `aria-current="true"` pour l'entrée demandée
  - `DefinitionGlossaire({ sigle }: { sigle: string })` : bloc `[data-definition-demandee]`
  - `PanneauGlossaire()` : `<aside>` nommé « Glossaire » (rôle `complementary`), bouton « Fermer le glossaire »
  - `FeuilleGlossaire()` : `<dialog>` modal nommé « Glossaire », bouton « Fermer le glossaire »
  - `CadreGlossaire({ children }: { children: ReactNode })`, `REQUETE_PANNEAU = '(min-width: 1024px)'` : bouton flottant « Glossaire » (`aria-expanded`), réserve de largeur (`pr-96`) quand le panneau est ouvert

**Décision d'emplacement du bouton « Glossaire » :** `App.tsx` n'a ni en-tête ni gabarit commun (chaque écran rend son propre `<main>`) ; le bouton est donc fixe en bas à droite (`fixed right-4 bottom-4`), au-dessus du panneau quand celui-ci est ouvert (le panneau garde une marge basse `pb-24`). Sous 1024 px, `body` reçoit une marge basse de 4,5 rem pour que le bouton ne masque jamais la fin d'une page. En haut à droite, il chevaucherait le compteur « n / N » du quiz.

**Palier d'exécution suggéré :** `implementer` (Sonnet) — composants React, `<dialog>` natif, requêtes média et tests Playwright à faire passer sur deux formats d'écran ; code fourni, mais le débogage e2e demande du jugement.

- [ ] **Étape 4.1 — Écrire le test Playwright (échec attendu).** Créer `e2e/glossaire.spec.ts` :

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Glossaire des sigles (issue #7). Téléphone : projet par défaut (Pixel 7, écran tactile, sans survol) ; feuille du
 * bas modale. Ordinateur : 1280 × 800, sans écran tactile, avec survol ; bulle et panneau latéral.
 * Pas de `document` ni de `matchMedia` dans une fonction passée à page.evaluate (tsconfig.node.json sans DOM) :
 * expression en chaîne, comme theme.spec.ts.
 */

const ORDINATEUR = { viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false };

async function verifierAxe(page: Page, nom: string): Promise<void> {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${nom} : ${v.id} (${v.nodes.length})`), nom).toEqual([]);
}

/** Sigles de la liste du glossaire, dans l'ordre affiché. */
async function siglesListes(conteneur: Locator): Promise<string[]> {
  return conteneur.locator('li[id^="glossaire-"]').evaluateAll((els) => els.map((e) => e.id.slice('glossaire-'.length)));
}

for (const theme of ['dark', 'light'] as const) {
  test.describe(`bouton Glossaire (thème ${theme === 'dark' ? 'sombre' : 'clair'})`, () => {
    test.use({ colorScheme: theme });

    test('téléphone : le bouton ouvre la feuille, Échap la ferme et rend le focus', async ({ page }) => {
      await page.goto('/');
      // Fermé, le glossaire n'est pas dans la page (parcours.spec.ts y cherche des noms de partis pendant le quiz).
      await expect(page.locator('body')).not.toContainText('Taxe sur la valeur ajoutée');
      const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
      await expect(bouton).toHaveAttribute('aria-expanded', 'false');
      await bouton.tap();
      const feuille = page.getByRole('dialog', { name: 'Glossaire' });
      await expect(feuille).toBeVisible();
      await expect(bouton).toHaveAttribute('aria-expanded', 'true');
      const sigles = await siglesListes(feuille);
      expect(sigles).toContain('TVA');
      expect(sigles).toEqual([...sigles].sort((a, b) => a.localeCompare(b, 'fr')));
      await expect(feuille.locator('[aria-current]')).toHaveCount(0);
      await verifierAxe(page, 'feuille ouverte par le bouton');
      await page.keyboard.press('Escape');
      await expect(feuille).toBeHidden();
      await expect(bouton).toBeFocused();
      await expect(page.locator('body')).not.toContainText('Taxe sur la valeur ajoutée');
    });

    test('téléphone : la feuille se ferme par son bouton et par un tap sur le fond', async ({ page }) => {
      await page.goto('/');
      const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
      const feuille = page.getByRole('dialog', { name: 'Glossaire' });
      await bouton.tap();
      await feuille.getByRole('button', { name: 'Fermer le glossaire' }).tap();
      await expect(feuille).toBeHidden();
      await expect(bouton).toBeFocused();
      await bouton.tap();
      await expect(feuille).toBeVisible();
      // En haut de l'écran, au-dessus de la feuille (85 % de la hauteur au plus) : le fond.
      await page.touchscreen.tap(200, 20);
      await expect(feuille).toBeHidden();
      await expect(bouton).toBeFocused();
    });

    test.describe('ordinateur', () => {
      test.use(ORDINATEUR);

      test('le bouton ouvre le panneau, qui réserve sa largeur, puis le rétracte', async ({ page }) => {
        await page.goto('/');
        const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
        await bouton.click();
        const panneau = page.getByRole('complementary', { name: 'Glossaire' });
        await expect(panneau).toBeVisible();
        await expect(bouton).toHaveAttribute('aria-expanded', 'true');
        expect(await siglesListes(panneau)).toContain('TVA');
        // Le contenu, centré, se range à gauche du panneau au lieu de passer dessous.
        const contenu = (await page.locator('main').boundingBox())!;
        const cote = (await panneau.boundingBox())!;
        expect(contenu.x + contenu.width).toBeLessThanOrEqual(cote.x);
        await verifierAxe(page, 'panneau ouvert par le bouton');
        await bouton.click();
        await expect(panneau).toBeHidden();
        await expect(bouton).toHaveAttribute('aria-expanded', 'false');
        await bouton.click();
        await panneau.getByRole('button', { name: 'Fermer le glossaire' }).click();
        await expect(panneau).toBeHidden();
        await expect(bouton).toBeFocused();
      });
    });
  });
}
```

- [ ] **Étape 4.2 — Construire, lancer, constater l'échec.**

```bash
npm run build
PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test e2e/glossaire.spec.ts
```

Attendu : 6 tests en échec (2 thèmes × 3), sur `getByRole('button', { name: 'Glossaire', exact: true })` introuvable.

- [ ] **Étape 4.3 — Requête média réactive.** Créer `app/glossaire/media.ts` :

```ts
import { useCallback, useSyncExternalStore } from 'react';

/** Vrai tant que la requête média est satisfaite ; se met à jour quand elle change (rotation, redimensionnement). */
export function useMedia(requete: string): boolean {
  const abonner = useCallback(
    (rappel: () => void) => {
      const liste = window.matchMedia(requete);
      liste.addEventListener('change', rappel);
      return () => liste.removeEventListener('change', rappel);
    },
    [requete],
  );
  return useSyncExternalStore(abonner, () => window.matchMedia(requete).matches, () => false);
}
```

- [ ] **Étape 4.4 — Liste et définition demandée.** Créer `app/glossaire/ListeGlossaire.tsx` :

```tsx
import { useEffect } from 'react';
import { paquet } from '../paquet.ts';
import { ENTREES } from './donnees.ts';
import { comportementDefilement, idAncre } from './etat.ts';

/**
 * Toutes les entrées, par ordre alphabétique (ordre du paquet). L'entrée demandée porte aria-current ; avec
 * `defiler`, elle est amenée dans la vue (instantanément si les animations sont réduites). Les explications ne sont
 * pas annotées : pas de sigle cliquable dans le glossaire lui-même.
 */
export function ListeGlossaire({ entree, demande, defiler }: { entree: string | null; demande: number; defiler: boolean }) {
  useEffect(() => {
    if (!defiler || !entree) return;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(idAncre(entree))?.scrollIntoView({ block: 'start', behavior: comportementDefilement(reduit) });
  }, [entree, demande, defiler]);

  return (
    <ul className="flex flex-col gap-3" aria-label="Sigles, par ordre alphabétique">
      {paquet.glossaire.map((e) => {
        const demandee = e.sigle === entree;
        return (
          <li
            key={e.sigle}
            id={idAncre(e.sigle)}
            aria-current={demandee ? 'true' : undefined}
            className={`scroll-mt-2 rounded-xl p-3 ${demandee ? 'border-l-4 border-or bg-or/15' : 'bg-nuit'}`}
          >
            <p>
              <strong>{e.sigle}</strong> — {e.developpe}
            </p>
            <p className="mt-1 text-sm text-sourdine">{e.explication}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** En tête de la feuille (téléphone) : la définition demandée, avant la liste complète. */
export function DefinitionGlossaire({ sigle }: { sigle: string }) {
  const e = ENTREES.get(sigle);
  if (!e) return null;
  return (
    <section data-definition-demandee aria-label={`Définition de ${e.sigle}`} className="mb-4 rounded-xl border-l-4 border-or bg-nuit p-3">
      <p className="font-semibold">
        {e.sigle} — {e.developpe}
      </p>
      <p className="mt-1">{e.explication}</p>
    </section>
  );
}
```

- [ ] **Étape 4.5 — Panneau (ordinateur).** Créer `app/glossaire/PanneauGlossaire.tsx` :

```tsx
import { useGlossaire } from './GlossaireProvider.tsx';
import { ListeGlossaire } from './ListeGlossaire.tsx';

/**
 * Ordinateur (≥ 1024 px) : panneau fixe à droite, non modal. Le contenu lui laisse sa largeur (CadreGlossaire) ;
 * le bouton « Glossaire » reste en bas à droite, au-dessus de la marge basse de la liste.
 */
export function PanneauGlossaire() {
  const { etat, fermer } = useGlossaire();
  return (
    <aside
      aria-labelledby="titre-panneau-glossaire"
      className="fixed inset-y-0 right-0 z-40 flex w-96 flex-col border-l border-or/40 bg-nuit-clair text-creme"
    >
      <header className="flex items-center justify-between gap-3 border-b border-or/30 px-4 py-3">
        <h2 id="titre-panneau-glossaire" className="font-serif text-2xl font-semibold">
          Glossaire
        </h2>
        <button type="button" onClick={fermer} className="min-h-11 text-sm text-sourdine underline">
          Fermer le glossaire
        </button>
      </header>
      {/* Zone défilante atteignable au clavier (axe : scrollable-region-focusable). */}
      <div tabIndex={0} role="region" aria-label="Liste du glossaire" className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-24">
        <ListeGlossaire entree={etat.entree} demande={etat.demande} defiler />
      </div>
    </aside>
  );
}
```

- [ ] **Étape 4.6 — Feuille (téléphone).** Créer `app/glossaire/FeuilleGlossaire.tsx` :

```tsx
import { useEffect, useRef } from 'react';
import { useGlossaire } from './GlossaireProvider.tsx';
import { DefinitionGlossaire, ListeGlossaire } from './ListeGlossaire.tsx';

/**
 * Téléphone et tablette (< 1024 px) : feuille du bas, <dialog> natif ouvert en modal (focus piégé, fond inerte,
 * Échap). Fermeture par Échap (événement close), par le bouton ou par un tap sur le fond ; le fournisseur rend
 * ensuite le focus au déclencheur. Montée seulement à l'ouverture : démontée, elle quitte la couche supérieure.
 */
export function FeuilleGlossaire() {
  const { etat, fermer } = useGlossaire();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // Pas de close() au démontage : en mode strict, il fermerait aussitôt la feuille rouverte.
    const dialogue = ref.current;
    if (dialogue && !dialogue.open) dialogue.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-modal="true"
      aria-labelledby="titre-feuille-glossaire"
      className="feuille-glossaire"
      onClose={fermer}
      onClick={(e) => {
        // Un clic sur le fond (::backdrop) cible le <dialog> lui-même ; un clic dans la feuille cible son contenu.
        if (e.target === e.currentTarget) fermer();
      }}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-or/30 px-4 py-3">
          <h2 id="titre-feuille-glossaire" className="font-serif text-2xl font-semibold">
            Glossaire
          </h2>
          <button type="button" onClick={fermer} className="min-h-11 text-sm text-sourdine underline">
            Fermer le glossaire
          </button>
        </header>
        <div tabIndex={0} role="region" aria-label="Liste du glossaire" className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-6">
          {etat.entree && <DefinitionGlossaire sigle={etat.entree} />}
          <ListeGlossaire entree={etat.entree} demande={etat.demande} defiler={false} />
        </div>
      </div>
    </dialog>
  );
}
```

- [ ] **Étape 4.7 — Cadre : bouton, réserve de largeur, choix de la présentation.** Créer `app/glossaire/CadreGlossaire.tsx` :

```tsx
import type { ReactNode } from 'react';
import { FeuilleGlossaire } from './FeuilleGlossaire.tsx';
import { useGlossaire } from './GlossaireProvider.tsx';
import { useMedia } from './media.ts';
import { PanneauGlossaire } from './PanneauGlossaire.tsx';

/** À partir de cette largeur (lg de Tailwind), le glossaire s'ouvre en panneau latéral ; en dessous, en feuille du bas. */
export const REQUETE_PANNEAU = '(min-width: 1024px)';

/** Entoure les écrans : bouton « Glossaire » persistant, et panneau ou feuille quand le glossaire est ouvert. */
export function CadreGlossaire({ children }: { children: ReactNode }) {
  const { etat, basculer } = useGlossaire();
  const large = useMedia(REQUETE_PANNEAU);
  const panneau = etat.ouvert && large;
  return (
    <>
      {/* Panneau ouvert : le contenu, centré, se recentre dans l'espace restant au lieu de passer dessous. */}
      <div className={panneau ? 'pr-96' : undefined}>{children}</div>
      <button
        type="button"
        aria-expanded={etat.ouvert}
        onClick={(e) => basculer(e.currentTarget)}
        className="fixed right-4 bottom-4 z-50 min-h-11 rounded-full border border-or/60 bg-nuit-clair px-5 font-semibold text-creme shadow-lg"
      >
        Glossaire
      </button>
      {etat.ouvert && (large ? <PanneauGlossaire /> : <FeuilleGlossaire />)}
    </>
  );
}
```

- [ ] **Étape 4.8 — Brancher dans l'application.** Dans `app/App.tsx` :

Après `import { Resultats } from './ecrans/Resultats.tsx';`, ajouter :

```tsx
import { CadreGlossaire } from './glossaire/CadreGlossaire.tsx';
import { GlossaireProvider } from './glossaire/GlossaireProvider.tsx';
```

Remplacer :

```tsx
    <MotionConfig reducedMotion="user">
      {ecran === 'duel' && duel && !estTerminee(duel) ? (
```

par :

```tsx
    <GlossaireProvider>
    <MotionConfig reducedMotion="user">
      <CadreGlossaire>
      {ecran === 'duel' && duel && !estTerminee(duel) ? (
```

et remplacer :

```tsx
      )}
    </MotionConfig>
  );
}
```

par :

```tsx
      )}
      </CadreGlossaire>
    </MotionConfig>
    </GlossaireProvider>
  );
}
```

(Le grand ternaire des écrans n'est pas réindenté, pour un diff lisible ; le dépôt n'a pas de formateur imposé.)

- [ ] **Étape 4.9 — Styles.** À la fin de `app/index.css`, ajouter :

```css

/*
 * Glossaire (issue #7). Feuille du bas (< 1024 px) : <dialog> natif, collé en bas de l'écran, fond assombri.
 * Le bouton « Glossaire » est fixe en bas à droite : sous 1024 px, une marge basse évite qu'il masque la fin d'une page.
 */
.feuille-glossaire {
  margin: auto 0 0;
  width: 100%;
  max-width: 100%;
  max-height: 85dvh;
  overflow: hidden;
  border: 0;
  border-radius: 1rem 1rem 0 0;
  padding: 0;
  background: var(--color-nuit-clair);
  color: var(--color-creme);
}

.feuille-glossaire::backdrop {
  background: rgb(0 0 0 / 0.6);
}

@media (max-width: 1023.98px) {
  body {
    padding-bottom: 4.5rem;
  }
}
```

- [ ] **Étape 4.10 — Relancer.**

```bash
npm run build
PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test e2e/glossaire.spec.ts e2e/csp.spec.ts e2e/accessibilite.spec.ts e2e/largeur.spec.ts
```

Attendu : les 6 tests de `glossaire.spec.ts` passent, ainsi que `csp`, `accessibilite` et `largeur` (le bouton flottant ne crée ni violation axe, ni violation de CSP, ni défilement horizontal).

- [ ] **Étape 4.11 — Commit** (via `git-ops`) :

```bash
git add app/glossaire/media.ts app/glossaire/ListeGlossaire.tsx app/glossaire/PanneauGlossaire.tsx app/glossaire/FeuilleGlossaire.tsx app/glossaire/CadreGlossaire.tsx app/App.tsx app/index.css e2e/glossaire.spec.ts
git commit -m "feat(glossaire): ajouter le panneau, la feuille et le bouton du glossaire" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

---

## Tâche 5 — `<Sigle>`, `<Texte>` et annotation des textes affichés

**Files :**
- Create : `app/glossaire/Sigle.tsx`, `app/glossaire/Texte.tsx`
- Modify : `app/index.css`, `app/ecrans/Quiz.tsx`, `app/ecrans/QuizDuel.tsx`, `app/ecrans/Depliants.tsx`, `app/ecrans/Extraits.tsx`, `app/ecrans/Defi.tsx`, `app/ecrans/Resultats.tsx`, `app/ecrans/ResultatsDuel.tsx`, `app/pages/FicheCandidat.tsx`, `app/pages/Banque.tsx`, `app/pages/Methode.tsx`, `app/pages/Markdown.tsx`, `app/ecrans/Vieprivee.tsx`, `e2e/largeur.spec.ts`
- Test : `e2e/glossaire.spec.ts` (ajouts)

**Interfaces :**
- Consumes : `segmenter`, `Segment` (T2) ; `INDEX`, `ENTREES` (T3) ; `useGlossaire().ouvrir` (T3) ; `useMedia` (T4).
- Produces :
  - `Texte({ children }: { children: string | null | undefined })` : rend le texte, chaque sigle connu devenant un `<Sigle>` ; le (i) est calculé par appel (un appel = un bloc de texte).
  - `Sigle({ texte, sigle, premiere }: { texte: string; sigle: string; premiere: boolean })` : `span.sigle` > `button.sigle-bouton[data-sigle]` (+ `data-premiere` à la première occurrence) et, si visible, `span[role=tooltip]`.

**Ce qui est annoté, et ce qui ne l'est pas.** Annotés : énoncés (quiz, duel, défi, résultats, fiche, banque), Précision, Impact (changement, pour, contre), reformulations et citations des extraits, descriptions du journal des modifications, documents Markdown (Méthodologie, Grille, Critère, critère complet de la page Candidats), paragraphe « Ce que voit l'hébergeur » de la Vie privée. Non annotés, car un `<button>` ne peut pas être imbriqué dans un autre contrôle : titres de sources (liens), libellés de boutons, `<summary>`, `<label>`. Non annotés par choix : identifiants de questions (`FIS-015`), champ `parti` des candidats (affiché dans les boutons de la liste des candidats ; les sigles de partis cités dans les textes sont, eux, annotés, avec l'entrée neutre « Parti politique. », voir T6), lignes du journal de tirage, descriptions de badges (texte maison sans sigle). L'accueil et les textes en dur de la Méthode n'ont pas de sigle.

**Choix du (i).** Pseudo-élément `::after` au texte de remplacement vide (`content: 'i' / ''`), sous `@media (hover: none)`, sur `.sigle-bouton[data-premiere]` : décoratif comme le demande la spec (`aria-hidden`), mais absent aussi de `textContent` et `innerText`. Un `<span aria-hidden>` aurait ajouté « i » au texte des titres `<h1>` que lisent les tests existants (`innerText`, `toHaveText`) et les lecteurs de texte brut.

**Palier d'exécution suggéré :** `implementer` (Sonnet) — composant à états (survol, focus, Échap) et douze fichiers à modifier sans casser les tests existants.

- [ ] **Étape 5.1 — Ajouter les tests Playwright (échec attendu).** Dans `e2e/glossaire.spec.ts`, ajouter après la ligne `import { expect, test, type Locator, type Page } from '@playwright/test';` :

```ts
import { lancer } from './outils.ts';
```

puis, après la fonction `siglesListes`, ajouter :

```ts
/** Banque de questions, chapitre Fiscalité déplié : FIS-015, FIS-019 et FIS-020 contiennent « TVA ». */
async function ouvrirBanqueFiscalite(page: Page): Promise<Locator> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Questions', exact: true }).click();
  await page.locator('summary', { hasText: 'Fiscalité' }).click();
  return page.locator('details[open] .sigle-bouton[data-sigle="TVA"]').first();
}

/** Fiche de Marine Le Pen, tous chapitres dépliés (énoncés et extraits annotés). */
async function ouvrirFicheDepliee(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Candidats', exact: true }).click();
  await page.getByRole('button', { name: /Marine Le Pen/ }).click();
  // all() n'attend pas : attendre que la fiche soit rendue.
  await expect(page.locator('summary').first()).toBeVisible();
  for (const s of await page.locator('summary').all()) await s.click();
}

/** Un sigle cliquable dans un lien, un bouton, un résumé ou une étiquette serait un contrôle imbriqué. */
const IMBRIQUES = 'a .sigle, button .sigle, summary .sigle, label .sigle';
```

Puis, à la fin du fichier, ajouter :

```ts
test.describe('sigles dans les textes', () => {
  test('les textes sont annotés, jamais à l’intérieur d’un contrôle', async ({ page }) => {
    await ouvrirBanqueFiscalite(page);
    await expect(page.locator('details[open] .sigle-bouton[data-sigle="TVA"]')).toHaveCount(3);
    for (const s of await page.locator('summary').all()) await s.click();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);

    await ouvrirFicheDepliee(page);
    await expect(page.locator('.sigle-bouton:visible').first()).toBeVisible();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);

    await page.goto('/');
    await page.getByRole('button', { name: 'Méthode', exact: true }).click();
    for (const onglet of ['Méthodologie', 'Grille de codage', "Critère d'inclusion", 'Journal des modifications']) {
      await page.getByRole('tab', { name: onglet }).click();
      await expect(page.getByRole('tabpanel')).not.toContainText('Chargement…');
      await expect(page.locator(IMBRIQUES), onglet).toHaveCount(0);
    }

    await lancer(page, 'Express');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);
  });

  test('le nom accessible et le texte d’un énoncé ne changent pas', async ({ page }) => {
    const tva = await ouvrirBanqueFiscalite(page);
    await expect(tva).toHaveAccessibleName('TVA');
    const ligne = page.locator('details[open] li').filter({ has: page.locator('.sigle-bouton[data-sigle="TVA"]') }).first();
    // Le (i) est un pseudo-élément : il n'entre ni dans le texte ni dans le nom accessible.
    await expect(ligne).not.toContainText('TVAi');
    await expect(ligne).toContainText(/FIS-0\d\d · La TVA /);
  });

  test('téléphone : un tap sur un sigle ouvre la feuille sur sa définition', async ({ page }) => {
    const tva = await ouvrirBanqueFiscalite(page);
    await tva.tap();
    const feuille = page.getByRole('dialog', { name: 'Glossaire' });
    await expect(feuille.locator('[data-definition-demandee]')).toContainText('Taxe sur la valeur ajoutée');
    await expect(feuille.locator('#glossaire-TVA')).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(tva).toBeFocused();
  });

  test.describe('ordinateur', () => {
    test.use(ORDINATEUR);

    test('le survol montre la bulle ; le clic ouvre le panneau sur l’entrée', async ({ page }) => {
      const tva = await ouvrirBanqueFiscalite(page);
      await tva.hover();
      const bulle = page.getByRole('tooltip');
      await expect(bulle).toContainText('Taxe sur la valeur ajoutée');
      await expect(tva).toHaveAttribute('aria-describedby', (await bulle.getAttribute('id'))!);
      await tva.click();
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      await expect(panneau.locator('#glossaire-TVA')).toHaveAttribute('aria-current', 'true');
      await expect(tva).toBeFocused();
    });
  });
});
```

- [ ] **Étape 5.2 — Construire, lancer, constater l'échec.**

```bash
npm run build
PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test e2e/glossaire.spec.ts
```

Attendu : les 6 tests de T4 passent ; les 4 nouveaux échouent (aucun `.sigle-bouton` dans la page).

- [ ] **Étape 5.3 — Composant `<Sigle>`.** Créer `app/glossaire/Sigle.tsx` :

```tsx
import { useEffect, useId, useState } from 'react';
import { ENTREES } from './donnees.ts';
import { useGlossaire } from './GlossaireProvider.tsx';
import { useMedia } from './media.ts';

/**
 * Un sigle du glossaire dans un texte : un seul bouton, souligné en pointillé. Clic ou tap : ouvre le glossaire sur
 * son entrée. Sur un appareil avec survol, une bulle (role="tooltip") s'affiche au survol et au focus (WCAG 1.4.13) :
 * survolable (elle est dans la zone survolée), persistante tant que le pointeur ou le focus reste, fermée par Échap.
 * Sans survol (tactile), pas de bulle ; le (i) de la première occurrence est dessiné en CSS (index.css).
 */
export function Sigle({ texte, sigle, premiere }: { texte: string; sigle: string; premiere: boolean }) {
  const { ouvrir } = useGlossaire();
  const survolable = useMedia('(hover: hover)');
  const [survol, setSurvol] = useState(false);
  const [focus, setFocus] = useState(false);
  // Échap masque la bulle jusqu'au prochain survol ou focus.
  const [masquee, setMasquee] = useState(false);
  const id = useId();
  const entree = ENTREES.get(sigle);
  const visible = survolable && (survol || focus) && !masquee && entree !== undefined;

  useEffect(() => {
    if (!visible) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMasquee(true);
    };
    document.addEventListener('keydown', touche);
    return () => document.removeEventListener('keydown', touche);
  }, [visible]);

  return (
    <span
      className="sigle"
      onMouseEnter={() => {
        setSurvol(true);
        setMasquee(false);
      }}
      onMouseLeave={() => setSurvol(false)}
    >
      <button
        type="button"
        className="sigle-bouton"
        data-sigle={sigle}
        data-premiere={premiere ? '' : undefined}
        aria-describedby={visible ? id : undefined}
        onFocus={() => {
          setFocus(true);
          setMasquee(false);
        }}
        onBlur={() => setFocus(false)}
        onClick={(e) => ouvrir(sigle, e.currentTarget)}
      >
        {texte}
      </button>
      {visible && (
        <span role="tooltip" id={id} className="bulle">
          <span className="bulle-contenu">
            <strong>{entree.sigle}</strong> — {entree.developpe}. {entree.explication}
          </span>
        </span>
      )}
    </span>
  );
}
```

- [ ] **Étape 5.4 — Composant `<Texte>`.** Créer `app/glossaire/Texte.tsx` :

```tsx
import { Fragment } from 'react';
import { segmenter } from '../../core/glossaire/index.ts';
import { INDEX } from './donnees.ts';
import { Sigle } from './Sigle.tsx';

/**
 * Texte affiché dont les sigles du glossaire deviennent des <Sigle>. Un appel = un bloc de texte : le (i) ne marque
 * que la première occurrence de chaque sigle dans ce bloc. Ne pas utiliser dans un lien, un bouton, un <summary> ni
 * un <label> (pas de contrôle imbriqué).
 */
export function Texte({ children }: { children: string | null | undefined }) {
  if (!children) return null;
  return (
    <>
      {segmenter(children, INDEX).map((s, i) =>
        s.type === 'texte' ? <Fragment key={i}>{s.texte}</Fragment> : <Sigle key={i} texte={s.texte} sigle={s.sigle} premiere={s.premiere} />,
      )}
    </>
  );
}
```

- [ ] **Étape 5.5 — Styles.** À la fin de `app/index.css`, ajouter :

```css

/*
 * Sigle du glossaire : bouton au soulignement pointillé or, dans le flux du texte (police, taille et graisse héritées).
 * Bulle au-dessus du sigle ; sa marge basse transparente fait pont avec le sigle, pour qu'on puisse la survoler.
 */
.sigle {
  position: relative;
}

.sigle-bouton {
  font: inherit;
  color: inherit;
  cursor: help;
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--color-or);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.2em;
}

/* Le (i) : décoratif, absent du nom accessible et du texte (texte de remplacement vide), appareils sans survol. */
@media (hover: none) {
  .sigle-bouton[data-premiere]::after {
    content: 'i' / '';
    display: inline-block;
    margin-left: 0.15em;
    width: 1.1em;
    height: 1.1em;
    border-radius: 9999px;
    background: var(--color-or);
    color: var(--color-nuit);
    font: italic 700 0.65em/1.1em var(--font-serif);
    text-align: center;
    vertical-align: super;
  }
}

.bulle {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 30;
  width: max-content;
  max-width: min(20rem, 80vw);
  padding-bottom: 0.375rem;
}

.bulle-contenu {
  display: block;
  border: 1px solid var(--color-or);
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-nuit-clair);
  color: var(--color-creme);
  font: 400 0.875rem/1.4 var(--font-sans);
  font-style: normal;
  text-align: left;
  box-shadow: 0 6px 20px rgb(0 0 0 / 0.35);
}
```

- [ ] **Étape 5.6 — Annoter les écrans.** Dans chaque fichier, ajouter l'import `import { Texte } from '<chemin>/glossaire/Texte.tsx';` (chemin : `../glossaire/Texte.tsx` depuis `app/ecrans/` et `app/pages/`), à la suite des imports existants, puis faire les remplacements suivants.

`app/ecrans/Quiz.tsx` et `app/ecrans/QuizDuel.tsx` (même ligne dans les deux fichiers) — remplacer :

```tsx
          <h1 className="mt-1 font-serif text-3xl leading-snug font-semibold">{question.enonce}</h1>
```

par :

```tsx
          <h1 className="mt-1 font-serif text-3xl leading-snug font-semibold">
            <Texte>{question.enonce}</Texte>
          </h1>
```

`app/ecrans/Depliants.tsx` — remplacer :

```tsx
        <p className="mt-1 rounded-xl bg-nuit-clair p-3 text-sm leading-relaxed">{question.precision}</p>
```

par :

```tsx
        <p className="mt-1 rounded-xl bg-nuit-clair p-3 text-sm leading-relaxed">
          <Texte>{question.precision}</Texte>
        </p>
```

remplacer :

```tsx
            <p>{question.impact.changement}</p>
```

par :

```tsx
            <p>
              <Texte>{question.impact.changement}</Texte>
            </p>
```

remplacer :

```tsx
              {question.impact.pour}
```

par :

```tsx
              <Texte>{question.impact.pour}</Texte>
```

et remplacer :

```tsx
              {question.impact.contre}
```

par :

```tsx
              <Texte>{question.impact.contre}</Texte>
```

`app/ecrans/Extraits.tsx` — remplacer :

```tsx
          <p>{e.reformulation}</p>
          {e.citation && <p className="mt-1 italic">« {e.citation} »</p>}
```

par :

```tsx
          <p>
            <Texte>{e.reformulation}</Texte>
          </p>
          {e.citation && (
            <p className="mt-1 italic">
              « <Texte>{e.citation}</Texte> »
            </p>
          )}
```

`app/ecrans/Defi.tsx` — remplacer :

```tsx
        <p className="mt-1 font-semibold">{manche.enonce}</p>
```

par :

```tsx
        <p className="mt-1 font-semibold">
          <Texte>{manche.enonce}</Texte>
        </p>
```

remplacer :

```tsx
        <p className="mt-2">{repondu ? manche.revelation.reformulation : manche.indice.reformulation}</p>
```

par :

```tsx
        <p className="mt-2">
          <Texte>{repondu ? manche.revelation.reformulation : manche.indice.reformulation}</Texte>
        </p>
```

et remplacer :

```tsx
          <p className="mt-2 italic">« {repondu ? manche.revelation.citation : manche.indice.citation} »</p>
```

par :

```tsx
          <p className="mt-2 italic">
            « <Texte>{repondu ? manche.revelation.citation : manche.indice.citation}</Texte> »
          </p>
```

`app/ecrans/Resultats.tsx` — remplacer :

```tsx
      <p className="font-semibold">{q?.enonce}</p>
```

par :

```tsx
      <p className="font-semibold">
        <Texte>{q?.enonce}</Texte>
      </p>
```

`app/ecrans/ResultatsDuel.tsx` — remplacer :

```tsx
                    <p className="font-semibold">{q.enonce}</p>
```

par :

```tsx
                    <p className="font-semibold">
                      <Texte>{q.enonce}</Texte>
                    </p>
```

`app/pages/FicheCandidat.tsx` — remplacer :

```tsx
                    <p className="font-semibold">{q(p.questionId)?.enonce}</p>
```

par :

```tsx
                    <p className="font-semibold">
                      <Texte>{q(p.questionId)?.enonce}</Texte>
                    </p>
```

`app/pages/Banque.tsx` — remplacer :

```tsx
                  <span className="text-sourdine">{q.id}</span> · {q.enonce}
```

par :

```tsx
                  <span className="text-sourdine">{q.id}</span> · <Texte>{q.enonce}</Texte>
```

et remplacer :

```tsx
                  {q.id} · <strong>{q.statut === 'suspendue' ? 'Suspendue' : 'Archivée'}</strong> · {q.enonce}
```

par :

```tsx
                  {q.id} · <strong>{q.statut === 'suspendue' ? 'Suspendue' : 'Archivée'}</strong> · <Texte>{q.enonce}</Texte>
```

`app/pages/Methode.tsx` — remplacer :

```tsx
                <p className="mt-1">{e.description}</p>
```

par :

```tsx
                <p className="mt-1">
                  <Texte>{e.description}</Texte>
                </p>
```

`app/pages/Markdown.tsx` (import `import { Texte } from '../glossaire/Texte.tsx';` après `import type { ReactNode } from 'react';`) — remplacer :

```tsx
    if (/^\*\*.+\*\*$/.test(morceau)) return <strong key={i}>{morceau.slice(2, -2)}</strong>;
```

par :

```tsx
    if (/^\*\*.+\*\*$/.test(morceau)) return <strong key={i}><Texte>{morceau.slice(2, -2)}</Texte></strong>;
```

remplacer :

```tsx
    if (/^\*.+\*$/.test(morceau)) return <em key={i}>{morceau.slice(1, -1)}</em>;
```

par :

```tsx
    if (/^\*.+\*$/.test(morceau)) return <em key={i}><Texte>{morceau.slice(1, -1)}</Texte></em>;
```

et remplacer :

```tsx
    return morceau;
  });
```

par :

```tsx
    // Texte brut : sigles annotés. Le code et les titres de liens ne le sont pas (pas de bouton dans un lien).
    return <Texte key={i}>{morceau}</Texte>;
  });
```

Mettre à jour le commentaire d'en-tête de `Markdown.tsx` : remplacer `Écrit pour les documents du dépôt ; pas de HTML brut, donc rien d'injecté dans la page.` par `Écrit pour les documents du dépôt ; pas de HTML brut, donc rien d'injecté dans la page. Les sigles du glossaire sont annotés (<Texte>).`

`app/ecrans/Vieprivee.tsx` (import `import { Texte } from '../glossaire/Texte.tsx';` en tête de fichier) — le paragraphe devient une chaîne pour que `<Texte>` l'annote (« IP » le sera dès son entrée au glossaire, T6). Avant `export function Vieprivee`, ajouter :

```tsx
const HEBERGEUR =
  "Le site est hébergé chez Railway. Comme tout hébergeur, il voit les requêtes de chargement du site : adresse IP, " +
  "page demandée, type de navigateur. Le serveur du projet n'écrit aucun journal, mais Railway conserve ses propres " +
  "journaux, pour une durée qui dépend de son offre (de 3 à 90 jours selon l'offre). Le service tourne dans un centre " +
  "de données européen (Pays-Bas) ; votre requête peut cependant passer par un point d'entrée du réseau Railway situé " +
  'ailleurs. Vos réponses au quiz, elles, ne transitent jamais par le serveur.';

```

puis remplacer :

```tsx
        <p className="mt-2">
          Le site est hébergé chez Railway. Comme tout hébergeur, il voit les requêtes de chargement du site : adresse IP,
          page demandée, type de navigateur. Le serveur du projet n'écrit aucun journal, mais Railway conserve ses propres
          journaux, pour une durée qui dépend de son offre (de 3 à 90 jours selon l'offre). Le service tourne dans un centre
          de données européen (Pays-Bas) ; votre requête peut cependant passer par un point d'entrée du réseau Railway situé
          ailleurs. Vos réponses au quiz, elles, ne transitent jamais par le serveur.
        </p>
```

par :

```tsx
        <p className="mt-2">
          <Texte>{HEBERGEUR}</Texte>
        </p>
```

- [ ] **Étape 5.7 — Adapter `e2e/largeur.spec.ts`.** Le critère complet (Markdown annoté) contient des listes : `main ul li button` attraperait des sigles. Remplacer les deux occurrences de `page.locator('main ul li button')` par `page.locator('main > section > ul > li > button')` (les lignes de candidats).

- [ ] **Étape 5.8 — Relancer.**

```bash
npx tsc -b
npm run build
PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test e2e/glossaire.spec.ts e2e/largeur.spec.ts e2e/accessibilite.spec.ts e2e/parcours.spec.ts e2e/impact.spec.ts e2e/csp.spec.ts
```

Attendu : `tsc` sans erreur ; les 10 tests de `glossaire.spec.ts` passent, ainsi que `largeur`, `accessibilite`, `parcours`, `impact` et `csp`.

- [ ] **Étape 5.9 — Commit** (via `git-ops`) :

```bash
git add app/glossaire/Sigle.tsx app/glossaire/Texte.tsx app/index.css app/ecrans/Quiz.tsx app/ecrans/QuizDuel.tsx app/ecrans/Depliants.tsx app/ecrans/Extraits.tsx app/ecrans/Defi.tsx app/ecrans/Resultats.tsx app/ecrans/ResultatsDuel.tsx app/pages/FicheCandidat.tsx app/pages/Banque.tsx app/pages/Methode.tsx app/pages/Markdown.tsx app/ecrans/Vieprivee.tsx e2e/largeur.spec.ts e2e/glossaire.spec.ts
git commit -m "feat(glossaire): annoter les sigles des textes affichés" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

---

## Tâche 6 — Contenu : inventaire, rédaction, relecture aveugle, test d'exhaustivité

**Files :**
- Create : `app/glossaire/exceptions.ts`, `app/glossaire/textes.ts`, `scripts/inventaire-glossaire.ts`, `app/glossaire.test.ts`, `docs/glossaire/consigne-redaction.md`, `docs/glossaire/consigne-relecture.md`, `docs/glossaire/relecture.json`
- Modify : `package.json` (script `glossaire:inventaire`), `tsconfig.node.json`, `data/glossaire.json`, `data/journal.json`, fichiers générés `app/donnees/paquet.json` et `app/donnees/pages.json`
- Test : `app/glossaire.test.ts`

**Interfaces :**
- Consumes : `extraireSigles` (T2) ; `paquet.glossaire` (T1) ; `Paquet` (`app/paquet.ts`), `Pages` (`app/pages/donnees.ts`) ; règles de `validate.ts` (T1 : sigles et formes uniques, 25 mots au plus).
- Produces :
  - `EXCEPTIONS_GLOSSAIRE: ReadonlyMap<string, string>` (mot → raison)
  - `textesAffiches(paquet: Pick<Paquet, 'questions' | 'positions' | 'defi'>, pages: Pick<Pages, 'docs' | 'journal' | 'horsJeu'>): string[]` — exactement les champs que T5 passe à `<Texte>`, plus les versions anonymisées du défi (devinette)
  - `texteAnnotableMarkdown(source: string): string`
  - `npm run glossaire:inventaire` : TSV `mot, occurrences, statut, contexte` sur stdout, résumé sur stderr

**État de départ mesuré (paquet de `develop` au 13 octobre 2026) :** 127 mots en capitales dans les textes affichés : 4 au glossaire (OTAN, PIB, TVA, UE), 20 exceptions, **103 absents** à traiter (la spec estimait « environ 60 entrées »). Les absents : AAH, AASM, ADEME, AESH, AFER, AFP, AME, APL, ARS, BFM, BFMTV, BIRD, BRAV, BTP, C3E, C3S, CAP, CDI, CE1, CE2, CEDH, CEE, CESE, CETA, CFE, CHSCT, CJUE, CM2, CO2, COR, CP, CRE, CROSS, CSG, CSM, CVAE, DEPP, DGA, DPE, EDF, EDIP, EPR, EPR2, ETI, FNSEA, GAFAM, GW, IA, ICI, IFI, IGGN, IGPN, IREF, ISF, JDD, JO, JORF, LBD, LBD40, LCI, LCP, LFI, NFP, OCDE, OFB, OIT, ONG, ONU, OQTF, PAC, PCF, PDG, PFAS, PLFSS, PME, POC, PPE3, PS, RATP, REP, RIC, RMC, RN, RSA, RTE, RTL, SAFE, SAMP, SCALP, SMIC, SMR, SNU, SP95, T2A, TF1, TGV, THC, TICPE, TPE, TTC, UFE, ZAN, ZFE. S'y ajoute IP (page Vie privée, texte en dur, hors inventaire).

**Paliers :** outillage, test et consignes (étapes 6.1 à 6.8) : `implementer-light` (contenu fourni) ; rédaction (6.9) : `implementer-hard` (Opus) avec recherche web ; relecture aveugle (6.10) : `reviewer` (Sonnet), contexte neuf ; corrections (6.11) : `implementer-light` ; cas `bloquant` : soumis à l'utilisateur par le superviseur, jamais tranchés par un agent.

Deux commits : outillage d'abord (sans le test, qui serait rouge), puis contenu avec le test (jamais de test rouge sur la branche).

- [ ] **Étape 6.1 — Exceptions.** Créer `app/glossaire/exceptions.ts` :

```ts
/**
 * Mots en capitales des textes affichés qui ne sont pas des sigles à expliquer (issue #7), avec la raison de
 * l'exception. Le test d'exhaustivité (app/glossaire.test.ts) exige que tout autre mot en capitales ait son entrée
 * au glossaire, et que chaque exception soit encore utilisée. Sans DOM : lu par node.
 */
const MARQUEUR = "marqueur d'anonymisation du défi";
const IDENTIFIANT = 'préfixe d’identifiant de question (journal des modifications)';

export const EXCEPTIONS_GLOSSAIRE: ReadonlyMap<string, string> = new Map([
  ['CANDIDAT', MARQUEUR],
  ['PARTI', MARQUEUR],
  ['SLOGAN', MARQUEUR],
  ['DEF', IDENTIFIANT],
  ['ECO', IDENTIFIANT],
  ['EDU', IDENTIFIANT],
  ['ENV', IDENTIFIANT],
  ['EUR', IDENTIFIANT],
  ['FIS', IDENTIFIANT],
  ['IMM', IDENTIFIANT],
  ['INS', IDENTIFIANT],
  ['RET', IDENTIFIANT],
  ['SAN', IDENTIFIANT],
  ['SEC', IDENTIFIANT],
  ['VALIDÉ', 'mot mis en capitales pour l’emphase (statut de la méthodologie)'],
  ['CNS', 'code de procédure d’une référence documentaire européenne (« 2018/0073(CNS) »)'],
  ['II', 'chiffre romain (« Messmer II »)'],
  ['GP', 'fragment du nom propre d’un média (« GP-TV »)'],
  ['TV', 'fragment du nom propre d’un média (« GP-TV »)'],
  ['README', 'nom de fichier du dépôt'],
]);
```

- [ ] **Étape 6.2 — Textes affichés.** Créer `app/glossaire/textes.ts` :

```ts
/**
 * Textes que l'application affiche et annote avec <Texte> (issue #7), un élément par bloc de texte. Source unique
 * de l'inventaire (scripts/inventaire-glossaire.ts) et du test d'exhaustivité (app/glossaire.test.ts) : un écran qui
 * annote un nouveau champ doit l'ajouter ici. Sans DOM : lu par node.
 */
import type { Paquet } from '../paquet.ts';
import type { Pages } from '../pages/donnees.ts';

/** Ce que <Markdown> annote : ni le code en ligne, ni les liens (titre et adresse), qui ne reçoivent pas de bouton. */
export function texteAnnotableMarkdown(source: string): string {
  return source.replace(/`[^`]+`/g, ' ').replace(/\[[^\]]+\]\([^)]+\)/g, ' ');
}

/** Version anonymisée d'un extrait, montrée pendant la devinette du défi (scripts/bundle.ts). */
interface ExtraitDefi {
  reformulation_anonymisee?: string | null;
  citation_anonymisee?: string | null;
}

export function textesAffiches(paquet: Pick<Paquet, 'questions' | 'positions' | 'defi'>, pages: Pick<Pages, 'docs' | 'journal' | 'horsJeu'>): string[] {
  const textes: (string | null | undefined)[] = [];
  for (const q of paquet.questions) {
    textes.push(q.enonce, q.precision);
    if (q.impact) textes.push(q.impact.changement, q.impact.pour, q.impact.contre);
  }
  for (const liste of Object.values(paquet.positions)) {
    for (const p of liste) for (const e of p.extraits ?? []) textes.push(e.reformulation, e.citation);
  }
  for (const liste of Object.values(paquet.defi)) {
    for (const p of liste as { extraits: ExtraitDefi[] }[]) {
      for (const x of p.extraits) textes.push(x.reformulation_anonymisee, x.citation_anonymisee);
    }
  }
  for (const q of pages.horsJeu) textes.push(q.enonce);
  for (const e of pages.journal) textes.push(e.description);
  for (const d of Object.values(pages.docs)) textes.push(texteAnnotableMarkdown(d));
  return textes.filter((t): t is string => typeof t === 'string' && t !== '');
}
```

- [ ] **Étape 6.3 — Script d'inventaire.** Créer `scripts/inventaire-glossaire.ts` :

```ts
/**
 * Inventaire des mots en capitales des textes affichés (issue #7) : `npm run glossaire:inventaire`.
 * Sortie TSV sur stdout (mot, occurrences, statut, premier contexte), triée par statut puis par mot ; résumé sur
 * stderr. Statuts : glossaire (sigle ou forme d'une entrée), exception (app/glossaire/exceptions.ts), absent (à
 * ajouter au glossaire ou aux exceptions : app/glossaire.test.ts échoue tant qu'il en reste).
 * Lit le paquet et les pages produits par `npm run bundle` : relancer le bundle après une modification de data/.
 */
import { readFileSync } from 'node:fs';
import { extraireSigles } from '../core/glossaire/index.ts';
import { EXCEPTIONS_GLOSSAIRE } from '../app/glossaire/exceptions.ts';
import { textesAffiches } from '../app/glossaire/textes.ts';
import type { Paquet } from '../app/paquet.ts';
import type { Pages } from '../app/pages/donnees.ts';

const lire = <T>(chemin: string): T => JSON.parse(readFileSync(new URL(`../${chemin}`, import.meta.url), 'utf8')) as T;
const paquet = lire<Paquet>('app/donnees/paquet.json');
const pages = lire<Pages>('app/donnees/pages.json');

const auGlossaire = new Set(paquet.glossaire.flatMap((e) => [e.sigle, ...(e.formes ?? [])]));
const mots = new Map<string, { n: number; contexte: string }>();
for (const texte of textesAffiches(paquet, pages)) {
  for (const mot of extraireSigles(texte)) {
    const m = mots.get(mot);
    if (m) m.n++;
    else {
      const i = texte.indexOf(mot);
      mots.set(mot, { n: 1, contexte: texte.slice(Math.max(0, i - 40), i + mot.length + 40).replace(/\s+/g, ' ') });
    }
  }
}

const ORDRE = { absent: 0, exception: 1, glossaire: 2 } as const;
type Statut = keyof typeof ORDRE;
const statut = (mot: string): Statut => (auGlossaire.has(mot) ? 'glossaire' : EXCEPTIONS_GLOSSAIRE.has(mot) ? 'exception' : 'absent');
const lignes = [...mots.entries()].sort(([a], [b]) => ORDRE[statut(a)] - ORDRE[statut(b)] || a.localeCompare(b, 'fr'));
console.log('mot\toccurrences\tstatut\tcontexte');
for (const [mot, { n, contexte }] of lignes) console.log(`${mot}\t${n}\t${statut(mot)}\t${contexte}`);
const compte = (s: Statut): number => lignes.filter(([m]) => statut(m) === s).length;
console.error(`${lignes.length} mots en capitales : ${compte('glossaire')} au glossaire, ${compte('exception')} exceptions, ${compte('absent')} absents`);
```

Dans `package.json`, après la ligne `"bundle:check": "tsx scripts/bundle.ts --check",`, ajouter :

```json
    "glossaire:inventaire": "tsx scripts/inventaire-glossaire.ts",
```

- [ ] **Étape 6.4 — `tsconfig.node.json`.** Dans `include`, remplacer `"app/glossaire/etat.test.ts", ` par `"app/glossaire/etat.test.ts", "app/glossaire/exceptions.ts", "app/glossaire/textes.ts", ` (fichiers lus par node : pas de DOM).

- [ ] **Étape 6.5 — Vérifier l'outillage.**

```bash
npx tsc -b
npm run glossaire:inventaire > /tmp/inventaire-glossaire.tsv
head -3 /tmp/inventaire-glossaire.tsv
```

Attendu : `tsc` sans erreur ; sur stderr `127 mots en capitales : 4 au glossaire, 20 exceptions, 103 absents` (si `develop` a changé de données depuis le 13 octobre, les nombres peuvent varier ; la suite reste valable) ; première ligne de données `AAH	2	absent	…`.

- [ ] **Étape 6.6 — Commit de l'outillage** (via `git-ops`) :

```bash
git add app/glossaire/exceptions.ts app/glossaire/textes.ts scripts/inventaire-glossaire.ts package.json tsconfig.node.json
git commit -m "feat(glossaire): inventorier les sigles des textes affichés" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

- [ ] **Étape 6.7 — Test d'exhaustivité et de contenu (échec attendu, non commité ici).** Créer `app/glossaire.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { extraireSigles } from '../core/glossaire/index.ts';
import pagesBrutes from './donnees/pages.json';
import { EXCEPTIONS_GLOSSAIRE } from './glossaire/exceptions.ts';
import { textesAffiches } from './glossaire/textes.ts';
import type { Pages } from './pages/donnees.ts';
import { paquet } from './paquet.ts';

/** Glossaire des sigles (issue #7) : exhaustivité et règles de contenu, sur le paquet et les pages générés. */

const pages = pagesBrutes as unknown as Pages;
const textes = textesAffiches(paquet, pages);
const auGlossaire = new Set(paquet.glossaire.flatMap((e) => [e.sigle, ...(e.formes ?? [])]));
const motsAffiches = new Set(textes.flatMap(extraireSigles));
const echapper = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Partis et mouvements cités dans les textes : mention neutre seulement (spec, « Règles »). */
const PARTIS = ['LFI', 'NFP', 'PCF', 'PS', 'RN'];
const MENTION_NEUTRE = /^(Parti|Mouvement) politique\.$/;

describe('glossaire', () => {
  it('chaque mot en capitales affiché a son entrée ou une exception (npm run glossaire:inventaire)', () => {
    const absents = [...motsAffiches].filter((m) => !auGlossaire.has(m) && !EXCEPTIONS_GLOSSAIRE.has(m)).sort();
    expect(absents).toEqual([]);
  });

  it('une exception n’est jamais aussi au glossaire, et reste utilisée', () => {
    const exceptions = [...EXCEPTIONS_GLOSSAIRE.keys()];
    expect(exceptions.filter((m) => auGlossaire.has(m))).toEqual([]);
    expect(exceptions.filter((m) => !motsAffiches.has(m))).toEqual([]);
  });

  it('les partis et mouvements ont la seule mention neutre', () => {
    const entrees = new Map(paquet.glossaire.map((e) => [e.sigle, e]));
    for (const sigle of PARTIS) {
      expect(entrees.get(sigle)?.explication, sigle).toMatch(MENTION_NEUTRE);
    }
  });

  it('aucun nom de candidat dans le glossaire', () => {
    const noms = paquet.candidats.map((c) => new RegExp(`(?<![\\p{L}])${echapper(c.nom)}(?![\\p{L}])`, 'u'));
    const fautifs = paquet.glossaire.filter((e) => noms.some((n) => n.test(`${e.developpe} ${e.explication}`))).map((e) => e.sigle);
    expect(fautifs).toEqual([]);
  });

  it('« IP » (page Vie privée, texte en dur hors du paquet) a son entrée', () => {
    expect(auGlossaire.has('IP')).toBe(true);
  });
});
```

Dans `tsconfig.node.json`, remplacer `"app/glossaire/textes.ts", ` par `"app/glossaire/textes.ts", "app/glossaire.test.ts", `.

```bash
npx tsc -b
npx vitest run app/glossaire.test.ts
```

Attendu : `tsc` sans erreur ; 3 échecs, 2 réussites : l'exhaustivité (liste des 103 absents), les partis (LFI, NFP, PCF, PS, RN sans entrée), « IP » ; les exceptions et l'absence de nom de candidat passent.

- [ ] **Étape 6.8 — Consignes.** Créer `docs/glossaire/consigne-redaction.md` :

~~~~markdown
# Consigne — rédaction du glossaire des sigles

Contexte : comparateur électoral open source et neutre pour la présidentielle 2027 (France). Un visiteur non spécialiste qui croise un sigle dans un énoncé, une précision, un encart Impact, un extrait de position ou une page de méthode obtient sa définition en bulle, en panneau ou en feuille. Date de rédaction : celle du jour. Ta connaissance s'arrête à mi-2026 : vérifie par recherche web la forme développée officielle de tout sigle dont tu n'es pas certain.

## Ce que tu dois produire

1. Lance `npm run glossaire:inventaire > /tmp/inventaire-glossaire.tsv` (après `npm run bundle`). Chaque ligne `absent` est un mot en capitales affiché sans entrée ; la colonne `contexte` montre la première occurrence. Ajoute aussi l'entrée `IP` (adresse IP, page Vie privée).
2. Pour chaque mot `absent`, l'un ou l'autre :
   - **une entrée** dans `data/glossaire.json` si c'est un sigle ou un acronyme qu'un non-spécialiste peut ne pas connaître (y compris SMIC, ONU, TGV : l'exhaustivité est voulue) ;
   - **une exception** dans `app/glossaire/exceptions.ts`, avec sa raison, si ce n'est pas un sigle à expliquer : nom propre qui n'est pas un sigle (« ICI », réseau de radios), fragment d'un code ou d'un nom propre, mot écrit en capitales pour l'emphase. En cas de doute, une entrée.
3. Une variante d'écriture affichée (casse, chiffre accolé) va dans `formes` de l'entrée principale **seulement** si elle désigne la même chose (« LBD40 » → forme de `LBD`). Si elle désigne autre chose (« EPR2 », modèle de réacteur distinct de l'« EPR » ; « CE1 », « CE2 », « CM2 », classes distinctes), fais une entrée par sigle. Un sigle ou une forme n'apparaît qu'une fois dans tout le fichier (contrôlé par `npm run data:validate`).

## Format d'une entrée

```json
{ "sigle": "CSG", "developpe": "Contribution sociale généralisée", "explication": "Prélèvement sur la plupart des revenus (salaires, pensions, revenus du patrimoine) qui finance la Sécurité sociale." }
```

`formes` est facultatif (`"formes": ["LBD40"]`). Fichier trié par `sigle` (ordre alphabétique français), indentation de deux espaces, comme les quatre entrées existantes.

## Règles

1. **`developpe`** : la forme développée exacte, avec la casse et l'orthographe officielles (nom officiel de l'organisme, de la loi, de l'impôt). Pour un sigle devenu un nom (« BFMTV »), le nom officiel et, si utile, ce que les lettres signifiaient.
2. **`explication`** : une phrase, 25 mots au plus (contrôlé par `npm run data:validate`), factuelle, au présent, compréhensible sans connaissance préalable. Elle dit ce qu'est la chose, pas ce qu'on en pense : aucun adjectif évaluatif, aucun argument, aucun chiffre contesté. Un montant ou un taux seulement s'il est fixé par un texte en vigueur et vérifié.
3. **Partis et mouvements** (LFI, NFP, PCF, PS, RN et tout autre) : `developpe` = nom officiel ; `explication` = exactement « Parti politique. » ou « Mouvement politique. », rien d'autre (une coalition électorale, comme le NFP, est un « Mouvement politique. »). Aucune position, aucun positionnement gauche-droite, aucune personne.
4. **Aucun nom de personne**, ni dans `developpe` ni dans `explication` (contrôlé par `app/glossaire.test.ts` pour les candidats). Les institutions publiques peuvent être nommées.
5. **Médias** (AFP, BFMTV, LCI, RTL…) : nature du média seulement (« Agence de presse française. », « Chaîne de télévision d'information en continu. »), sans ligne éditoriale ni propriétaire.
6. **Pas de sigle non développé dans une explication** sauf s'il a lui-même une entrée.

## À la fin

`npm run data:validate`, `npm run bundle`, `npx vitest run app/glossaire.test.ts` : tout doit passer. Réponds par : nombre d'entrées, d'exceptions ajoutées, et la liste des réserves (formes développées non vérifiées, choix d'entrée ou d'exception discutables), une ligne chacune. Ne commite pas.
~~~~

Créer `docs/glossaire/consigne-relecture.md` :

~~~~markdown
# Consigne — relecture aveugle du glossaire des sigles

Tu es RELECTEUR pour un comparateur électoral neutre (présidentielle 2027, France). Un autre rédacteur a écrit les entrées de `data/glossaire.json` et les exceptions de `app/glossaire/exceptions.ts`. Tu n'as pas vu sa rédaction se faire et tu ne la défends pas. Date de relecture : celle du jour. La consigne de rédaction est `docs/glossaire/consigne-redaction.md` : lis-la, ce sont les règles à contrôler.

Pour chaque entrée, contrôle :
1. **Exactitude de `developpe`** : forme développée officielle, orthographe et casse. Vérifie par recherche web tout sigle dont tu n'es pas certain (si une page refuse l'accès, note-le et passe).
2. **Neutralité de `explication`** : factuelle, sans jugement ni argument ; partis et mouvements réduits à « Parti politique. » ou « Mouvement politique. » ; médias réduits à leur nature ; aucun nom de personne.
3. **Lisibilité** pour un non-spécialiste, une phrase, 25 mots au plus.
4. **Formes** : chaque forme désigne bien la même chose que le sigle.

Contrôle aussi chaque exception ajoutée (un vrai sigle mis en exception est une erreur).

Verdict par entrée ou exception : `ok`, `corriger` (avec le texte de remplacement complet du champ) ou `bloquant` (problème de fond à soumettre à un humain).

Écris un tableau JSON dans `docs/glossaire/relecture.json` : `[{"sigle": "...", "verdict": "ok|corriger|bloquant", "remarques": "...", "corrections": {"developpe"?: "...", "explication"?: "...", "formes"?: ["..."], "exception"?: "entrée à créer à la place de l'exception"}}]`, une ligne par entrée et par exception ajoutée, puis réponds par un bilan d'une ligne par verdict non `ok`. Ne modifie aucun autre fichier.
~~~~

- [ ] **Étape 6.9 — Rédaction** (superviseur → `implementer-hard`, palier Opus, avec recherche web). Mission : « Dans le worktree `/home/mathieu/projects/Perso/choose-your-candidate-2027/.worktree/glossaire-acronymes`, applique `docs/glossaire/consigne-redaction.md`. Modifications autorisées : `data/glossaire.json`, `app/glossaire/exceptions.ts`, fichiers générés par `npm run bundle`. Ne commite pas. Retour : 15 lignes au plus. » Attendu : `npx vitest run app/glossaire.test.ts` vert, `npm run data:validate` affiche « N sigles au glossaire » (N ≈ 100).

- [ ] **Étape 6.10 — Relecture aveugle** (superviseur → `reviewer`, modèle Sonnet, contexte neuf : ni l'historique ni le compte rendu du rédacteur). Mission : « Dans le worktree `/home/mathieu/projects/Perso/choose-your-candidate-2027/.worktree/glossaire-acronymes`, applique `docs/glossaire/consigne-relecture.md`. Seul fichier à créer : `docs/glossaire/relecture.json`. Retour : 15 lignes au plus. »

- [ ] **Étape 6.11 — Corrections** (superviseur → `implementer-light`). Mission : « Applique à `data/glossaire.json` et `app/glossaire/exceptions.ts` les `corrections` des verdicts `corriger` de `docs/glossaire/relecture.json`, texte pour texte ; laisse les `bloquant` intacts ; puis `npm run data:validate && npm run bundle && npx vitest run app/glossaire.test.ts`. » Les cas `bloquant` sont présentés à l'utilisateur, qui tranche ; sa décision est appliquée et notée dans `remarques` de l'élément concerné (« Tranché par Mathieu : … »).

- [ ] **Étape 6.12 — Entrée de journal, régénération, vérification complète.**

```bash
node -e '
const fs = require("fs");
const journal = JSON.parse(fs.readFileSync("data/journal.json", "utf8"));
const glossaire = JSON.parse(fs.readFileSync("data/glossaire.json", "utf8"));
journal.entrees.push({
  date: new Date().toISOString().slice(0, 10),
  type: "ajout_glossaire",
  objets: ["data/glossaire.json"],
  description: `Création du glossaire des sigles : ${glossaire.length} entrées (forme développée et explication neutre d’une phrase), proposées en bulle, en panneau ou en feuille partout où un sigle apparaît. Rédaction puis relecture aveugle par un second agent ; trace dans docs/glossaire/relecture.json.`,
  auteur: "Claude, à la demande de Mathieu",
  reference: "création du glossaire des sigles (issue #7)",
});
fs.writeFileSync("data/journal.json", JSON.stringify(journal, null, 2) + "\n");
'
npm run bundle
npm run check
npm run glossaire:inventaire > /dev/null
```

Attendu : `npm run check` vert (validation, dérivés inchangés, paquet à jour, types, `tsc`, tous les tests vitest dont `app/glossaire.test.ts`, build) ; inventaire : `… 0 absents`. La description de l'entrée ne contient aucun mot en capitales (elle est affichée et inventoriée). Le glossaire et le journal sont hors de l'empreinte des données : `derive/` ne change pas.

- [ ] **Étape 6.13 — Commit du contenu** (via `git-ops`) :

```bash
git add data/glossaire.json data/journal.json app/glossaire/exceptions.ts app/glossaire.test.ts tsconfig.node.json app/donnees/paquet.json app/donnees/pages.json docs/glossaire/consigne-redaction.md docs/glossaire/consigne-relecture.md docs/glossaire/relecture.json
git commit -m "feat(glossaire): rédiger les entrées du glossaire et tester son exhaustivité" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

---

## Tâche 7 — Parcours complets bulle, panneau et feuille ; suite e2e entière

**Files :**
- Modify : `e2e/glossaire.spec.ts`

**Interfaces :**
- Consumes : tout ce qui précède ; glossaire complet (T6) : la liste longue rend significatifs les tests de défilement (`#glossaire-TVA` hors de la vue après remontée de la liste).
- Produces : rien.

**Dépendance de données assumée :** le test du (i) s'appuie sur la reformulation de FIS-019 de la fiche de Marine Le Pen (« … veut instaurer une TVA à 0 % … », « TVA » deux fois dans le paragraphe), comme `accessibilite.spec.ts` s'appuie déjà sur cette fiche. Si la donnée change, choisir un autre paragraphe affiché de façon stable (fiche dépliée) qui répète un sigle du glossaire.

**Pas de `getComputedStyle` nu dans une fonction passée à `evaluate`** (pas de DOM dans `tsconfig.node.json`) : passer par `e.ownerDocument.defaultView!.getComputedStyle(…)`. Une chaîne `'(e) => …'` n'est pas appelée par `locator.evaluate` (elle renvoie `undefined`).

**Palier d'exécution suggéré :** `implementer` (Sonnet) — tests fournis, mais un échec e2e (minutage, recouvrement par le bouton flottant) demande du diagnostic.

- [ ] **Étape 7.1 — Ajouter les tests.** À la fin de `e2e/glossaire.spec.ts`, ajouter :

```ts
test.describe('bulle, panneau et feuille sur un sigle', () => {
  test('téléphone : (i) à la première occurrence d’un bloc seulement ; tap, feuille, retour du focus', async ({ page }) => {
    await ouvrirFicheDepliee(page);
    // Reformulation de FIS-019 sur la fiche : « TVA » deux fois dans le même paragraphe.
    const bloc = page.locator('[data-extraits] p', { hasText: 'veut instaurer une TVA à 0 %' }).first();
    const tva = bloc.locator('.sigle-bouton[data-sigle="TVA"]');
    expect(await tva.count()).toBeGreaterThanOrEqual(2);
    const contenus = await tva.evaluateAll((els) => els.map((e) => e.ownerDocument.defaultView!.getComputedStyle(e, '::after').content));
    expect(contenus[0]).not.toBe('none');
    expect(contenus.slice(1)).toEqual(contenus.slice(1).map(() => 'none'));

    const feuille = page.getByRole('dialog', { name: 'Glossaire' });
    await tva.nth(1).tap();
    await expect(feuille.locator('[data-definition-demandee]')).toContainText('Taxe sur la valeur ajoutée');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await verifierAxe(page, 'feuille ouverte sur un sigle');
    await page.keyboard.press('Escape');
    await expect(feuille).toBeHidden();
    await expect(tva.nth(1)).toBeFocused();

    await tva.first().tap();
    await feuille.getByRole('button', { name: 'Fermer le glossaire' }).tap();
    await expect(feuille).toBeHidden();
    await expect(tva.first()).toBeFocused();

    await tva.first().tap();
    await expect(feuille).toBeVisible();
    await page.touchscreen.tap(200, 20);
    await expect(feuille).toBeHidden();
    await expect(tva.first()).toBeFocused();
  });

  test.describe('ordinateur', () => {
    test.use(ORDINATEUR);

    test('la bulle : au focus et au survol, survolable, fermée par Échap ; pas de (i)', async ({ page }) => {
      const tva = await ouvrirBanqueFiscalite(page);
      expect(await tva.evaluate((e) => e.ownerDocument.defaultView!.getComputedStyle(e, '::after').content)).toBe('none');
      const bulle = page.getByRole('tooltip');
      await tva.focus();
      await expect(bulle).toContainText('Taxe sur la valeur ajoutée');
      await expect(tva).toHaveAttribute('aria-describedby', (await bulle.getAttribute('id'))!);
      await verifierAxe(page, 'bulle ouverte');
      await page.keyboard.press('Escape');
      await expect(bulle).toHaveCount(0);
      await expect(tva).toBeFocused();
      await expect(tva).not.toHaveAttribute('aria-describedby');
      await tva.blur();
      await page.mouse.move(0, 0);
      await tva.hover();
      await expect(bulle).toBeVisible();
      // WCAG 1.4.13 : le pointeur passe du sigle à la bulle sans la fermer.
      await bulle.hover();
      await expect(bulle).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(bulle).toHaveCount(0);
    });

    test('le clic ouvre le panneau sur l’entrée, l’amène dans la vue, et y revient à chaque clic', async ({ page }) => {
      const tva = await ouvrirBanqueFiscalite(page);
      await tva.click();
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      const entree = panneau.locator('#glossaire-TVA');
      await expect(entree).toHaveAttribute('aria-current', 'true');
      await expect(entree).toBeInViewport();
      await expect(tva).toBeFocused();
      await verifierAxe(page, 'panneau ouvert sur une entrée');
      // Remonter la liste puis recliquer : le défilement repart.
      await panneau.getByRole('region', { name: 'Liste du glossaire' }).hover();
      await page.mouse.wheel(0, -100_000);
      await expect(entree).not.toBeInViewport();
      await tva.click();
      await expect(entree).toBeInViewport();
      // Échap ferme la bulle, pas le panneau (non modal).
      await page.mouse.move(0, 0);
      await tva.hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await expect(panneau).toBeVisible();
      await page.getByRole('button', { name: 'Glossaire', exact: true }).click();
      await expect(panneau).toBeHidden();
    });

    test.describe('animations permises', () => {
      test.use({ reducedMotion: 'no-preference' });

      test('le défilement doux amène aussi l’entrée dans la vue', async ({ page }) => {
        const tva = await ouvrirBanqueFiscalite(page);
        await tva.click();
        await expect(page.getByRole('complementary', { name: 'Glossaire' }).locator('#glossaire-TVA')).toBeInViewport();
      });
    });
  });
});
```

- [ ] **Étape 7.2 — Lancer le fichier, puis toute la suite.**

```bash
npm run build
PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test e2e/glossaire.spec.ts
PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test
```

Attendu : 14 tests dans `glossaire.spec.ts`, tous verts ; suite entière : 55 réussis, 2 sautés (`captures.spec.ts`, seulement avec `CAPTURES=1`), dont `csp`, `impact`, `parcours`, `accessibilite`, `largeur`, `hors-ligne` et `theme`. Ces nombres ont été mesurés avec un glossaire factice de 94 entrées ; ils ne dépendent pas du nombre d'entrées.

- [ ] **Étape 7.3 — Commit** (via `git-ops`) :

```bash
git add e2e/glossaire.spec.ts
git commit -m "test(glossaire): couvrir la bulle, le panneau et la feuille de bout en bout" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

---

## Tâche 8 — Documentation, vérification finale, revue, PR

**Files :**
- Create : `docs/glossaire/README.md`
- Modify : `README.md`

**Interfaces :** aucune (documentation).

**Palier d'exécution suggéré :** `implementer-light` (Haiku) pour la documentation ; `runner` pour les vérifications ; `reviewer` pour la revue ; `git-ops` pour la PR.

- [ ] **Étape 8.1 — Passation.** Créer `docs/glossaire/README.md` :

~~~~markdown
# Glossaire des sigles — passation

Les sigles des textes affichés (énoncés, Précision, encart Impact, extraits de positions, défi, banque de questions, journal des modifications, pages de méthode, paragraphe hébergeur de la Vie privée) sont soulignés en pointillé. Sur ordinateur : bulle au survol ou au focus, panneau latéral au clic. Sur téléphone : feuille du bas au tap, avec un (i) à la première occurrence de chaque sigle d'un bloc. Un bouton « Glossaire », en bas à droite, ouvre la liste complète à tout moment (issue #7).

## Où sont les choses

| Fichier | Rôle |
|---|---|
| `data/glossaire.json` | Entrées `{ sigle, developpe, explication, formes? }` (schéma `schemas/glossaire.schema.json`). Hors de l'empreinte des données : le modifier ne touche pas `derive/`. |
| `app/glossaire/exceptions.ts` | Mots en capitales qui ne sont pas des sigles, avec leur raison. |
| `app/glossaire/textes.ts` | Liste des champs affichés et annotés : à compléter si un écran annote un nouveau champ. |
| `core/glossaire/` | Découpage d'un texte en segments (fonction pure, testée). |
| `app/glossaire/` | Interface : `<Texte>`, `<Sigle>`, panneau, feuille, bouton. |
| `docs/glossaire/consigne-redaction.md`, `consigne-relecture.md`, `relecture.json` | Consignes et trace de la relecture aveugle. |

## Ajouter ou corriger un sigle

1. `npm run bundle`, puis `npm run glossaire:inventaire > /tmp/inventaire.tsv` : les lignes `absent` sont les mots à traiter.
2. Ajouter l'entrée à `data/glossaire.json` en suivant `docs/glossaire/consigne-redaction.md` (une phrase de 25 mots au plus, neutre ; partis et mouvements : « Parti politique. » ou « Mouvement politique. » seulement ; aucun nom de personne), ou une exception justifiée à `app/glossaire/exceptions.ts`.
3. Tracer la modification dans `data/journal.json` (type `ajout_glossaire`).
4. `npm run data:validate && npm run bundle && npm run check`. `app/glossaire.test.ts` échoue tant qu'un mot en capitales affiché n'a ni entrée ni exception.

## Limites connues

- Les titres de sources (liens), les libellés de boutons, les `<summary>` et les `<label>` ne sont pas annotés : un bouton ne peut pas être placé dans un autre contrôle.
- Le champ « origine » des questions n'est pas dans le paquet de l'application : il n'est ni affiché ni annoté.
- Une bulle dans un tableau Markdown à défilement horizontal peut être rognée par le tableau.
- Le (i) est calculé par bloc de texte rendu : dans un paragraphe Markdown mêlant gras et texte normal, chaque morceau compte comme un bloc.
~~~~

- [ ] **Étape 8.2 — `README.md`.** Remplacer :

```markdown
| `data/` | Source de vérité : candidats, axes, questions, positions codées, journal. Données uniquement, aucun code. |
```

par :

```markdown
| `data/` | Source de vérité : candidats, axes, questions, positions codées, glossaire des sigles, journal. Données uniquement, aucun code. |
```

remplacer :

```
npm run types:generate  # régénère core/types.generated.ts depuis schemas/
```

par :

```
npm run types:generate  # régénère core/types.generated.ts depuis schemas/
npm run glossaire:inventaire  # mots en capitales des textes affichés et leur statut au glossaire (docs/glossaire/README.md)
```

et, après la ligne ``- Chaque modification de `data/` est tracée dans `data/journal.json`.``, ajouter :

```markdown
- Un nouveau sigle dans un texte affiché exige son entrée dans `data/glossaire.json`, ou une exception justifiée dans `app/glossaire/exceptions.ts` : `npm test` échoue sinon (voir `docs/glossaire/README.md`).
```

- [ ] **Étape 8.3 — Vérification complète** (via `runner`).

```bash
npm run check
npm run glossaire:inventaire > /dev/null
PLAYWRIGHT_CHROMIUM_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npx playwright test
```

Attendu : `npm run check` vert ; inventaire `… 0 absents` ; Playwright : tout vert sauf les 2 tests de `captures.spec.ts`, sautés.

- [ ] **Étape 8.4 — Commit** (via `git-ops`, qui vérifie ensuite que l'arbre de travail est propre : aucun fichier généré oublié) :

```bash
git add docs/glossaire/README.md README.md
git commit -m "docs(glossaire): documenter la passation du glossaire des sigles" -m "Refs #7
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01HJjJJ3wz3MrnqEE2C5YJjY"
```

- [ ] **Étape 8.5 — Revue** (superviseur → `reviewer`, Sonnet, contexte neuf ; relancé en Opus seulement si le superviseur juge le diff critique). Entrées : le diff de la branche `feat/7-glossaire-acronymes` contre `develop`, la spec et la section « Review Focus » de ce plan ; ni l'historique ni les comptes rendus des auteurs. Corrections éventuelles : un commit `fix(glossaire): …` par point, mêmes pieds de commit.

- [ ] **Étape 8.6 — PR** (via `git-ops`, **seulement avec l'accord explicite de l'utilisateur**). Titre : `feat(glossaire): expliquer les sigles en bulle, panneau et feuille`. Corps : résumé des 8 tâches, nombre d'entrées (affiché par `npm run data:validate`), bilan de la relecture (`docs/glossaire/relecture.json`), limites connues (`docs/glossaire/README.md`), puis en pied `Closes #7`.

