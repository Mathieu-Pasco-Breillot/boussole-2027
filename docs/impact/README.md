# Encart « Impact » — passation de la vague 2

L'encart « Impact » s'affiche à côté de « Précision » sous chaque proposition du quiz : ce que la mesure changerait concrètement, puis ce qui fait débat (arguments des partisans et des opposants, attribués), avec ses sources. Le champ est `impact` dans `data/questions/<thème>.json` (schéma : `schemas/questions.schema.json`).

## État au 12 octobre 2026

| Thèmes | Questions actives | État |
|---|---|---|
| Institutions | 18 | En ligne, **validé** par Mathieu (rédaction Opus 5.5, relecture aveugle Sonnet 5.5) |
| Défense, Écologie et énergie, Économie et dette, Éducation, Fiscalité | 94 | En ligne, statut **pilote** (rédaction et relecture aveugle Sonnet 5.5 : 37 ok, 57 corrigées, 0 bloquant) |
| Immigration, Retraites, Santé, Sécurité, Union européenne | 94 | En ligne, statut **pilote** (rédaction Opus 5.5, relecture aveugle Sonnet 5.5 : 0 bloquant) |

Détail de la vague 2 (questions actives ; ok / corrigées à la relecture) :

| Thème | Questions | Ok | Corrigées |
|---|---|---|---|
| Retraites | 19 | — | — |
| Santé | 19 | 11 | 8 |
| Immigration | 21 | 12 | 9 |
| Sécurité | 20 | 14 | 6 |
| Union européenne | 15 | 6 | 9 |

## Reste à faire

- **Validation par Mathieu** pour passer les 10 thèmes pilotes (vagues 1 et 2) du statut « pilote » à « validé ».
- **Précisions signalées comme inexactes ou périmées, non modifiées** : liste ci-dessous. Chaque correction exigera une entrée `historique` sur la question et une entrée de journal.
- **Sources à vérifier à la main** : Légifrance, Dalloz et consilium.europa.eu étaient inaccessibles aux agents (403 / anti-bot). À vérifier : SEC-004 (art. L.435-1), SEC-013 (art. 132-25), SEC-015 (art. 122-6), EUR-001 (communiqué du Conseil du 14/07/2026).

## Précisions signalées comme inexactes ou périmées (non modifiées)

Vague 1 : DEF-001, DEF-002, DEF-003, ENV-004, ENV-024, ECO-009, ECO-011, EDU-017, FIS-008, FIS-009, FIS-016 (détail dans le bilan de la vague 1, projet Claude `phase-3/impact/bilan-vague-1.md`).

Vague 2 (d'après les brouillons et les relectures) :
- **IMM-001** : règle des « 12 mois dans un métier en tension » à confirmer (une source parle de 12 mois sur 24, avec 3 ans de résidence).
- **IMM-011** : la loi sur Mayotte aurait été promulguée le 12 mai 2025, la Précision évoque 2026.
- **IMM-014** : la proposition de loi du Sénat citée est introuvable.
- **RET-008** : « inscrite dans la loi depuis 2003 » ; le COR parle d'une pratique depuis 1987, légale depuis 1993.
- **RET-011** : la Précision cite cinq régimes fermés dont celui du CESE ; le COR n'en cite que quatre.
- **SAN-015** : date de censure du Conseil constitutionnel (28 février 2025) à vérifier, possible confusion avec la promulgation de la loi de financement.
- **SEC-009** : amende forfaitaire de 200 € ou de 500 € selon une version récente de Légifrance (non vérifiée).
- **SEC-014** : « 15 000 places » ou « jusqu'à 18 000 places » ?
- Autres Précisions signalées par les relectures, sans détail ici : RET-001, RET-005, RET-006 ; SAN-006, SAN-008, SAN-009, SAN-012 ; IMM-005, IMM-012, IMM-018 ; EUR-002, EUR-003, EUR-010, EUR-012, EUR-015 ; SEC-006, SEC-008, SEC-013, SEC-021 (le détail figure dans `vague-2/relecture-<thème>.json`).

Toute correction de Précision s'accompagne d'une entrée `historique` sur la question et d'une entrée de journal.

## Fichiers

- `consigne-redaction.md`, `consigne-relecture.md` : consignes des agents.
- `exemple-valide.json` : encart de référence validé par Mathieu (INS-009, Corse).
- `vague-2/themes/` : énoncés et Précisions des questions actives à traiter.
- `vague-2/brouillons/` : premiers jets avec leurs réserves (non publiables).
- `outils/integrer.py` : intégration dans les données.
