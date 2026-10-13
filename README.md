# Mon Isoloir

*Comparez les candidats à la présidentielle 2027, à l'abri des regards : vos réponses ne quittent jamais votre téléphone.*

Comparateur des positions des candidats à l'élection présidentielle de 2027. L'utilisateur répond à une série de
questions ; le site classe les candidats selon la proximité de leurs positions publiques avec ses réponses.
Chaque position est adossée à au moins une source vérifiable. Le calcul se fait entièrement dans le navigateur.

**État :** socle technique (lot 5b). Le site affiche une page « en construction » ; le calcul (lot 5c), le tirage
des questions (lot 5d) et l'interface (lot 5e) suivent.

## Structure

| Dossier | Rôle |
|---|---|
| `data/` | Source de vérité : candidats, axes, questions, positions codées, glossaire des sigles, journal. Données uniquement, aucun code. |
| `schemas/` | JSON Schema de chaque entité, alignés sur les fichiers réels. |
| `derive/` | Fichiers **générés** (discriminance, ancrage, couverture, accord entre codeurs). Ne jamais les éditer à la main. |
| `docs/` | Méthodologie, grille de codage, critère d'inclusion des candidats. |
| `scripts/` | Validation des données et calculs de `derive/`, avec leurs tests. |
| `core/` | Fonctions pures du comparateur (lots 5c et 5d) et types générés depuis les schémas. |
| `app/` | Interface (Vite, React, TypeScript, Tailwind, Motion, PWA). |

Chaîne de construction : validation des données (JSON Schema, sources, identifiants) → calculs `derive/` → application.

## Commandes

Node 22 ou plus.

```
npm ci
npm run data:validate   # valide les données
npm run derive          # recalcule derive/ (puis committer le résultat)
npm run derive:check    # échoue si derive/ n'est pas à jour
npm run types:generate  # régénère core/types.generated.ts depuis schemas/
npm run glossaire:inventaire  # mots en capitales des textes affichés et leur statut au glossaire (docs/glossaire/README.md)
npm test
npm run dev
npm run build           # valide, vérifie les types, compile
```

## Contribuer

Les données sont publiques et contestables. **Toute contribution touchant une position, un code ou une question
doit citer une source** (URL, de préférence primaire : programme, déclaration, vote) et, pour une position,
le passage qui la fonde (reformulation, ou citation de 14 mots maximum). Une contribution sans source est refusée.

- Contester une position : ouvrir une issue avec le modèle « Contester ou corriger une position ».
- Les règles de codage sont dans `docs/grille-codage.md`, le calcul dans `docs/methodologie.md`.
- Avant toute proposition : `npm run data:validate` et `npm test` doivent passer. La CI les exécute.
- Chaque modification de `data/` est tracée dans `data/journal.json`.
- Messages de commit au format conventional commits : voir [Messages de commit](#messages-de-commit).
- Un nouveau sigle dans un texte affiché exige son entrée dans `data/glossaire.json`, ou une exception justifiée dans `app/glossaire/exceptions.ts` : `npm test` échoue sinon (voir `docs/glossaire/README.md`).

## Vie privée

Le site ne collecte pas les réponses des utilisateurs : tout est calculé dans le navigateur. Le serveur est un
simple serveur de fichiers statiques, configuré sans journal d'accès (`Caddyfile`) avec une politique de
sécurité de contenu stricte. L'hébergeur (Railway) conserve ses propres journaux : voir la page « Vie privée »
du site.

## Versions et mise en ligne

Les **données** (`data/`, avec `derive/` et `docs/`) et l'**application** ont chacune leur numéro de version
([versionnage sémantique](https://semver.org/lang/fr/)), affiché en pied de page et sur la page Méthode du site :

| Composant | Tag | Correctif (x.y.**Z**) | Mineure (x.**Y**.0) | Majeure (**X**.0.0) |
|---|---|---|---|---|
| Données | `donnees-vX.Y.Z` | corrections de codage | candidats, questions, codages ajoutés | changement de méthode : résultats non comparables |
| Application | `application-vX.Y.Z` | corrections | nouvelles fonctions | rupture (anciennes parties illisibles…) |

Les numéros sont calculés par [release-please](https://github.com/googleapis/release-please) à partir des messages
de commit ([conventional commits](#messages-de-commit)) :

1. chaque push sur `develop` met à jour une **PR de release** qui propose les nouveaux numéros et les notes de version ;
2. fusionner cette PR crée les tags et les [GitHub Releases](https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027/releases),
   puis avance la branche `main` sur le commit publié ;
3. Railway déploie :
   - l'environnement `production` : service `prod`, branche `main`, https://mon-isoloir.up.railway.app ;
   - l'environnement `preprod` : service `preprod`, branche `develop`, https://preprod-preprod-a4b2.up.railway.app,
     signalé comme tel sur le site.

Chaque PR ouvre un environnement éphémère `choose-your-candidate-2027-pr-<n°>` (PR Environments, créé depuis
`preprod`), supprimé à la fermeture de la PR. Le déploiement attend le succès de la CI (« wait for CI »).

L'image est construite avec le `Dockerfile` (imposé par `railway.json`) et servie par Caddy. Les tests de bout en bout tournent avec les mêmes
en-têtes que le site en ligne, lus dans le `Caddyfile`. `main` ne reçoit jamais de commit direct.

### Messages de commit

Format [conventional commits](https://www.conventionalcommits.org/fr/) : type et portée en anglais ou en code,
description en français. La CI refuse les messages qui ne le respectent pas.

```
fix(donnees): Arthaud × ECO-003 passe de −1 à +1 (R1)
feat(donnees): codage de Raphaël Glucksmann (60 codes)
feat(donnees)!: grille v2, scores recalculés      ← majeure, avec un pied « BREAKING CHANGE: … »
feat(quiz): encart « Impact » dépliable
fix(duel): la position s'affiche après la réponse
docs(donnees): précision de la méthodologie § 4
chore: mise à jour des dépendances               ← n'apparaît pas dans les notes de version
```

Le composant qui change de version dépend des fichiers touchés : un commit qui modifie `data/` fait évoluer la
version des données, un commit qui modifie autre chose que `data/`, `derive/` et `docs/` fait évoluer celle de
l'application. Toute modification de méthode passe par `data/journal.json`, donc par `data/`.

## Licences

- **Code** (`app/`, `core/`, `scripts/`, `schemas/`, configuration) : [GNU AGPL-3.0](LICENSE). Quiconque propose une version modifiée du comparateur en ligne doit en publier le code source.
- **Données et documentation** (`data/`, `docs/`, `derive/`) : [CC BY 4.0](LICENSE-DONNEES), avec mention du projet. Les citations de tiers restent la propriété de leurs auteurs.
