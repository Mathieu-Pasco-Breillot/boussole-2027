# Consigne — rédaction de l'encart « Impact » (pilote Institutions)

Contexte : comparateur électoral open source et neutre pour la présidentielle 2027 (France). L'utilisateur lit une proposition (« énoncé ») et répond de « Tout à fait d'accord » à « Pas du tout d'accord ». Il dispose déjà d'un encart « Précision » (état actuel, contexte). L'encart « Impact » doit lui permettre de comprendre **ce que la mesure changerait** et **pourquoi elle est débattue**, sans jamais l'orienter.

Date de rédaction : celle du jour. Ta connaissance s'arrête à mi-2026 : vérifie par recherche web tout ce qui décrit l'état actuel (droit en vigueur, textes en cours, chiffres).

## Format attendu (un objet JSON par question)

```json
{
  "id": "INS-009",
  "changement": "2 à 4 phrases. Ce que la mesure modifierait concrètement : la règle actuelle, la nouvelle règle, qui est concerné, ordre de grandeur chiffré si une source fiable en donne un. Uniquement des faits établis et sourcés.",
  "pour": "1 à 2 phrases. Les principaux arguments avancés par ses partisans, formulés comme tels (« Ses partisans estiment que… », « Pour ses défenseurs, … »).",
  "contre": "1 à 2 phrases. Symétrique : arguments avancés par ses opposants.",
  "sources": [
    { "url": "https://…", "titre": "Titre exact de la page", "date_consultation": "2026-10-12", "nature": "primaire|secondaire|institutionnelle" }
  ],
  "reserves": "Texte libre pour le relecteur humain : ce que tu n'as pas pu vérifier, ou une difficulté de neutralité. Chaîne vide si rien."
}
```

## Règles

1. **Neutralité.** Aucun adjectif évaluatif (« juste », « dangereux », « efficace »…) dans `changement`. Les arguments sont toujours attribués (« ses partisans », « ses opposants ») et jamais validés ni réfutés. `pour` et `contre` ont une longueur et une force comparables (écart de longueur ≤ 30 %), et chacun reprend le meilleur argument de son camp.
2. **Aucun nom** de candidat, de parti, de personnalité politique dans les trois textes. Les sources, elles, peuvent nommer qui elles veulent. Les institutions publiques (Conseil d'État, Cour des comptes, Conseil constitutionnel…) peuvent être nommées.
3. **Pas de prédiction présentée comme un fait.** Un effet incertain va dans `pour`/`contre`, ou dans `changement` seulement s'il est chiffré par une institution, et alors attribué (« selon le Conseil d'État… »).
4. **Pas de redite** de la Précision : `changement` la complète, il ne la répète pas.
5. **Lisible par tout le monde** : phrases courtes, pas de jargon non expliqué (« loi organique » → « une loi d'application »). 80 mots maximum pour `changement`, 40 pour `pour` et `contre`.
6. **Sources** : au moins une par question, de préférence primaire ou institutionnelle (Légifrance, Assemblée nationale, Sénat, Conseil constitutionnel, Vie-publique, rapports publics), complétée au besoin par un média national. Ne cite que des pages réellement consultées par toi ; n'invente aucune URL ni aucun titre. Chaque fait de `changement` doit être retrouvable dans une des sources.
7. Ne reproduis pas de phrases des sources : reformule.
8. L'énoncé doit être lu **tel qu'il est écrit** (par exemple « 2 % des électeurs », « 350 députés »).

9. **Exemple validé** par le responsable du projet : `docs/impact/exemple-valide.json`. Vise ce niveau de précision et d'équilibre.
10. **Textes déjà validés** : si une question de ton lot figure dans `docs/impacts-en-attente.md` (cas de SEC-009), reprends son contenu tel quel en le répartissant dans les champs `changement` / `pour` / `contre` (les faits dans `changement`, les attentes des partisans dans `pour`, les objections dans `contre`), en ne retouchant que la forme. Signale-le dans `reserves`.
11. Si la Précision te paraît inexacte ou périmée après vérification, ne la modifie pas : explique-le dans `reserves` avec ta source.

## Livrable

Écris un tableau JSON valide (un objet par question du lot, dans l'ordre) dans le fichier de sortie indiqué dans ta mission, puis réponds par une ligne de bilan (nombre de questions, réserves éventuelles).
