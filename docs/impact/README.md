# Encart « Impact » — passation de la vague 2

L'encart « Impact » s'affiche à côté de « Précision » sous chaque proposition du quiz : ce que la mesure changerait concrètement, puis ce qui fait débat (arguments des partisans et des opposants, attribués), avec ses sources. Le champ est `impact` dans `data/questions/<thème>.json` (schéma : `schemas/questions.schema.json`).

## État au 12 octobre 2026

| Thèmes | Questions actives | État |
|---|---|---|
| Institutions | 18 | En ligne, **validé** par Mathieu (rédaction Opus 5.5, relecture aveugle Sonnet 5.5) |
| Défense, Écologie et énergie, Économie et dette, Éducation, Fiscalité | 95 | En ligne, statut **pilote** (rédaction et relecture aveugle Sonnet 5.5 : 37 ok, 57 corrigées, 0 bloquant ; EDU-020, rédigée ensuite, Opus 5.5 et relecture aveugle Sonnet 5.5 : corrigée, 0 bloquant) |
| Immigration, Retraites, Santé, Sécurité, Union européenne | 94 | En ligne, statut **pilote** (rédaction Opus 5.5, relecture aveugle Sonnet 5.5 : 0 bloquant) |

Détail de la vague 2 (questions actives ; ok / corrigées à la relecture) :

| Thème | Questions | Ok | Corrigées |
|---|---|---|---|
| Retraites | 19 | 11 | 8 |
| Santé | 19 | 11 | 8 |
| Immigration | 21 | 12 | 9 |
| Sécurité | 20 | 14 | 6 |
| Union européenne | 15 | 6 | 9 |

## Reste à faire

- **Validation par Mathieu** pour passer les 10 thèmes pilotes (vagues 1 et 2) du statut « pilote » à « validé ».
- **Précisions signalées comme inexactes ou périmées, non modifiées** : liste ci-dessous. Chaque correction exigera une entrée `historique` sur la question et une entrée de journal.
- **Sources à vérifier à la main** : Légifrance, Dalloz et consilium.europa.eu étaient inaccessibles aux agents (403 / anti-bot). À vérifier : SEC-004 (art. L.435-1), SEC-013 (art. 132-25), SEC-015 (art. 122-6), EUR-001 (communiqué du Conseil du 14/07/2026).

## Précisions signalées comme inexactes ou périmées (restant à traiter)

Vague 1 : DEF-001, DEF-002, DEF-003, ENV-004, ENV-024, ECO-009, ECO-011, EDU-017, FIS-008, FIS-009, FIS-016 (détail dans le bilan de la vague 1, projet Claude `phase-3/impact/bilan-vague-1.md`).

Vague 2 (d'après les brouillons et les relectures) :
- **RET-011** : la Précision cite cinq régimes fermés dont celui du CESE ; le COR n'en cite que quatre.
- **SEC-006** : chiffres du 1er août non relus dans le PDF du ministère.
- **SEC-021** : « sans suite à l'Assemblée nationale » non vérifiable ; la proposition de loi a été retransmise à l'Assemblée nationale en juillet 2024, statut ultérieur inconnu.
- Autres Précisions signalées par les relectures, sans détail ici : SAN-008, SAN-009, SAN-012 (non vérifiables) ; IMM-012 (non vérifiable) (le détail figure dans `vague-2/relecture-<thème>.json`).

Corrigées le 12 octobre 2026 après vérification (historique de la question et journal, type `reformulation`) : RET-001 (âge de 62 ans et 9 mois limité aux générations 1963 et 1964), RET-008 (« fin des années 1980 »), SAN-015 (votée en février 2025), IMM-001 (voie de l'article L. 435-4 du Ceseda), IMM-014 (titulaires d'un titre autorisant à travailler et réfugiés), EUR-002 (unanimité « en principe », sauf cas prévus par le traité), EUR-003 (26 à 38 milliards d'euros par an en moyenne, estimation de la direction générale du Trésor), SEC-009 (amende forfaitaire de 500 € depuis la loi n° 2026-798 du 18 août 2026), SEC-013 (règle pour les peines de six mois ou moins, sauf impossibilité). Encarts retouchés : RET-001 et SAN-019 (extension de l'accord préalable du contrôle médical).

À examiner par Mathieu : la loi n° 2026-798 ajoute une suspension du permis de conduire pour usage de stupéfiants, non mentionnée dans l'encart validé de SEC-009.

Vérifiées exactes le 12 octobre 2026, non modifiées : RET-005, RET-006, SAN-006, SAN-016, SAN-019 (Précision), IMM-005, IMM-011, IMM-018, EUR-010, EUR-012, EUR-015, SEC-008, SEC-014.

Toute correction de Précision s'accompagne d'une entrée `historique` sur la question et d'une entrée de journal.

## Fichiers

- `consigne-redaction.md`, `consigne-relecture.md` : consignes des agents.
- `exemple-valide.json` : encart de référence validé par Mathieu (INS-009, Corse).
- `vague-2/themes/` : énoncés et Précisions des questions actives à traiter.
- `vague-2/brouillons/` : premiers jets avec leurs réserves (non publiables).
- `outils/integrer.py` : intégration dans les données.
