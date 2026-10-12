# Encart « Impact » — passation de la vague 2

L'encart « Impact » s'affiche à côté de « Précision » sous chaque proposition du quiz : ce que la mesure changerait concrètement, puis ce qui fait débat (arguments des partisans et des opposants, attribués), avec ses sources. Le champ est `impact` dans `data/questions/<thème>.json` (schéma : `schemas/questions.schema.json`).

## État au 12 octobre 2026

| Thèmes | Questions actives | État |
|---|---|---|
| Institutions | 18 | En ligne, **validé** par Mathieu (rédaction Opus 5.5, relecture aveugle Sonnet 5.5) |
| Défense, Écologie et énergie, Économie et dette, Éducation, Fiscalité | 94 | En ligne, statut **pilote** (rédaction et relecture aveugle Sonnet 5.5 : 37 ok, 57 corrigées, 0 bloquant) |
| **Immigration, Retraites, Santé, Sécurité, Union européenne** | **94** | **À faire** : ce dossier |

## Ce qui reste à faire

Les brouillons de `vague-2/brouillons/` ont été rédigés alors que le quota de recherche web de la session était épuisé. **Ils ne sont pas publiables en l'état** :
- **Sécurité** : 7 questions sans aucune source (SEC-005, 010, 014, 017, 018, 019, 021), le reste surtout sur Wikipédia.
- **Union européenne** : presque tout sur Wikipédia ; une seule source primaire.
- **Santé** : sourçage partiel ; SAN-005 (pôle public du médicament) insuffisant ; SAN-018 décrit le texte avant son adoption définitive.
- **Immigration**, **Retraites** : faits principaux sourcés, mais plusieurs arguments pour/contre non sourcés et des Précisions à vérifier.

Chaque brouillon a un champ `reserves` qui liste précisément ce qui n'a pas été vérifié. On peut s'en servir comme point de départ, mais chaque fait doit être resourcé.

## Procédure, thème par thème

1. **Rédaction** (avec recherche web) : appliquer `consigne-redaction.md` aux questions de `vague-2/themes/theme-<thème>.json`. S'appuyer sur le brouillon et ses réserves, en remplaçant les pages Wikipédia par des sources primaires ou institutionnelles (Légifrance, Assemblée nationale, Sénat, Conseil constitutionnel, Conseil d'État, Cour des comptes, Insee, COR, Drees, Commission européenne…). Sortie : `vague-2/redaction-<thème>.json`.
   - **SEC-009** : reprendre le texte déjà validé par Mathieu dans `docs/impacts-en-attente.md`, en le répartissant dans les trois champs.
2. **Relecture aveugle** par un autre agent : appliquer `consigne-relecture.md`. Sortie : `vague-2/relecture-<thème>.json`. Le relecteur ne lit les `reserves` qu'après avoir donné son avis.
3. **Intégration** : `python3 docs/impact/outils/integrer.py <thème>`. Le script applique les corrections et refuse d'intégrer s'il reste un verdict bloquant ou une question sans source.
4. **Journal** : ajouter une entrée de type `ajout_impact` dans `data/journal.json` (voir les entrées du 12 octobre 2026).
5. **Contrôles** : `npm run derive && npm run bundle && npm run check`. Le test `app/impact.test.ts` bloque tout nom de candidat ou de parti dans les textes.
6. Quand les cinq thèmes sont faits : étendre le premier test de `app/impact.test.ts` à **toutes** les questions actives, et supprimer `docs/impacts-en-attente.md` (son contenu est alors intégré).

Conseils tirés des vagues précédentes : deux ou trois agents en parallèle au plus (les sites officiels renvoient des erreurs 429 au-delà) ; chaque agent écrit ses fichiers de travail hors du dépôt et dans un dossier qui lui est propre ; Opus fait nettement moins d'erreurs de précision que Sonnet (22 % de corrections contre 60 %).

## Précisions signalées comme inexactes ou périmées (non modifiées)

Vague 1 : DEF-001, DEF-002, DEF-003, ENV-004, ENV-024, ECO-009, ECO-011, EDU-017, FIS-008, FIS-009, FIS-016 (détail dans le bilan de la vague 1, projet Claude `phase-3/impact/bilan-vague-1.md`).

Vague 2 (d'après les brouillons) :
- **IMM-001** : règle des « 12 mois dans un métier en tension » à confirmer (une source parle de 12 mois sur 24, avec 3 ans de résidence).
- **IMM-011** : la loi sur Mayotte aurait été promulguée le 12 mai 2025, la Précision évoque 2026.
- **IMM-014** : la proposition de loi du Sénat citée est introuvable.
- **RET-008** : « inscrite dans la loi depuis 2003 » ; le COR parle d'une pratique depuis 1987, légale depuis 1993.
- **RET-011** : la Précision cite cinq régimes fermés dont celui du CESE ; le COR n'en cite que quatre.
- **SAN-015** : date de censure du Conseil constitutionnel (28 février 2025) à vérifier, possible confusion avec la promulgation de la loi de financement.

Toute correction de Précision s'accompagne d'une entrée `historique` sur la question et d'une entrée de journal.

## Fichiers

- `consigne-redaction.md`, `consigne-relecture.md` : consignes des agents.
- `exemple-valide.json` : encart de référence validé par Mathieu (INS-009, Corse).
- `vague-2/themes/` : énoncés et Précisions des questions actives à traiter.
- `vague-2/brouillons/` : premiers jets avec leurs réserves (non publiables).
- `outils/integrer.py` : intégration dans les données.
