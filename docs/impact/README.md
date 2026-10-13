# Encart « Impact » — passation de la vague 2

L'encart « Impact » s'affiche à côté de « Précision » sous chaque proposition du quiz : ce que la mesure changerait concrètement, puis ce qui fait débat (arguments des partisans et des opposants, attribués), avec ses sources. Le champ est `impact` dans `data/questions/<thème>.json` (schéma : `schemas/questions.schema.json`).

## État au 13 octobre 2026

| Thèmes | Questions actives | État |
|---|---|---|
| Institutions | 18 | En ligne, **validé** par Mathieu le 12 octobre (rédaction Opus 5.5, relecture aveugle Sonnet 5.5) |
| Défense, Écologie et énergie, Économie et dette, Éducation, Fiscalité | 95 | En ligne, **validé** par Mathieu (12-13 octobre) (rédaction et relecture aveugle Sonnet 5.5 : 37 ok, 57 corrigées, 0 bloquant ; EDU-020, rédigée ensuite, Opus 5.5 et relecture aveugle Sonnet 5.5 : corrigée, 0 bloquant) |
| Immigration, Retraites, Santé, Sécurité, Union européenne | 94 | En ligne, **validé** par Mathieu (12-13 octobre) (rédaction Opus 5.5, relecture aveugle Sonnet 5.5 : 0 bloquant) |

Les 207 encarts des questions actives ont le statut « valide ». Les encarts n'ont pas été relus question par question hors des corrections ci-dessous ; les points non vérifiables sont listés dans « Reste à faire ».

Détail de la vague 2 (questions actives ; ok / corrigées à la relecture) :

| Thème | Questions | Ok | Corrigées |
|---|---|---|---|
| Retraites | 19 | 11 | 8 |
| Santé | 19 | 11 | 8 |
| Immigration | 21 | 12 | 9 |
| Sécurité | 20 | 14 | 6 |
| Union européenne | 15 | 6 | 9 |

## Reste à faire

Points non vérifiables ou à reprendre (Légifrance, Dalloz et consilium.europa.eu étaient inaccessibles aux agents ; plusieurs PDF n'ont été lus que par résumé). Toute correction de Précision s'accompagne d'une entrée `historique` sur la question et d'une entrée de journal.

- **SEC-004** : formulation exacte du 4° de l'article L.435-1 du code de la sécurité intérieure.
- **SEC-009** : la loi n° 2026-798 du 18 août 2026 ajoute (art. 7, art. L.224-7 du code de la route) une suspension du permis de conduire pour usage de stupéfiants : décision du préfet, suspension provisoire de six mois au plus, usage répété, sans exigence de conduite. Sources secondaires seulement ; non ajoutée à l'encart validé.
- **SEC-013** : règle pour les peines de six mois ou moins (art. 132-25 du code pénal), non vérifiable sur Légifrance.
- **SEC-015** : formulation « c'est à eux de démontrer » (art. 122-6 du code pénal) non vérifiée ; la transmission au Sénat (proposition n° 866, 7 juillet 2026) n'est pas mentionnée dans la Précision.
- **SEC-006, SEC-021** : chiffres et dates lus via un résumé de PDF (ministère de la Justice ; site du Sénat, mise à jour du 30 janvier 2025). SEC-021 : l'énoncé omet les « atteintes aux intérêts fondamentaux de la nation » prévues par la proposition de loi.
- **EUR-001** : clusters 2 à 5 de la négociation et Précision (majorité des trois cinquièmes, 3/5) non vérifiés.
- **EDU-020** : chiffres de la loi n° 2026-103 du 19 février 2026 non vérifiés (Précision : projet de loi de finances) ; description d'origine (« propositions… août 2026 ») non étayée.
- **DEF-003** : date de début du service national volontaire non confirmée ; proposition de loi n° 1210 (contenu et absence d'adoption) non recontrôlés.
- **SAN-008, SAN-012** : suite des textes non vérifiée (SAN-008 : proposition de loi sénatoriale transmise à l'Assemblée nationale le 14 mai 2025 ; SAN-012 : texte du PLFSS 2025) ; la source caducee.net de l'encart de SAN-008 est à confirmer.
- **IMM-012** : l'origine cite toujours la proposition de loi constitutionnelle n° 2120 et l'encart s'appuie sur la décision du Conseil constitutionnel du 13 août 1993 ; ni l'un ni l'autre n'affirme qu'une révision constitutionnelle est nécessaire.
- **ENV-024** : « blocage refusé au printemps 2026 » non vérifiable.

Corrigées le 12 octobre 2026 après vérification (historique de la question et journal, type `reformulation`) : RET-001 (âge de 62 ans et 9 mois limité aux générations 1963 et 1964), RET-008 (« fin des années 1980 »), SAN-015 (votée en février 2025), IMM-001 (voie de l'article L. 435-4 du Ceseda), IMM-014 (titulaires d'un titre autorisant à travailler et réfugiés), EUR-002 (unanimité « en principe », sauf cas prévus par le traité), EUR-003 (26 à 38 milliards d'euros par an en moyenne, estimation de la direction générale du Trésor), SEC-009 (amende forfaitaire de 500 € depuis la loi n° 2026-798 du 18 août 2026), SEC-013 (règle pour les peines de six mois ou moins, sauf impossibilité), FIS-008 (CSG à taux variables pour les pensions de retraite et les allocations chômage), FIS-009 (délai de 8 ans de 2011 à 2013), ENV-004 (encart : filières betteraves, cerises, pommes et noisettes). Encarts retouchés : RET-001, SAN-019 (extension de l'accord préalable du contrôle médical), FIS-009, ENV-004.

Corrigées le 13 octobre 2026 (type `reformulation`) : Précisions de DEF-003, EDU-017, EDU-020, RET-011, SAN-008, SAN-009, SAN-012, IMM-012 et SEC-021 ; descriptions d'origine de SAN-009, SAN-012, SEC-006 et ECO-011 (sans nom de Premier ministre) ; EUR-001 (encart : attribution « selon la presse (Eunews, 14 juillet 2026) »), EDU-020 (encart, contre : chiffre en pourcentage retiré).

Vérifiées exactes le 12 octobre 2026, non modifiées : RET-005, RET-006, SAN-006, SAN-016, SAN-019 (Précision), IMM-005, IMM-011, IMM-018, EUR-010, EUR-012, EUR-015, SEC-008, SEC-014, DEF-001, DEF-002, ECO-009, FIS-016, ENV-004 (Précision), ENV-024 (première phrase exacte).

## Fichiers

- `consigne-redaction.md`, `consigne-relecture.md` : consignes des agents.
- `exemple-valide.json` : encart de référence validé par Mathieu (INS-009, Corse).
- `vague-2/themes/` : énoncés et Précisions des questions actives à traiter.
- `vague-2/brouillons/` : premiers jets avec leurs réserves (non publiables).
- `outils/integrer.py` : intégration dans les données.
