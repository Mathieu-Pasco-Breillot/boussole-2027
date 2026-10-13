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
- Le (i) est calculé par bloc : un appel à `<Texte>` est un bloc, et un paragraphe, un item, une cellule ou un titre Markdown est un bloc, quel que soit le style en ligne (gras, italique). Deux `<Texte>` dans un même `<p>` comptent donc pour deux blocs.
- Sous 1024 px, une marge basse de 4,5 rem réserve la place du bouton « Glossaire » : elle ajoute 72 px de défilement aux écrans pleine hauteur, mais sans elle le bouton masquerait les actions du bas.
- Au redimensionnement, le glossaire bascule entre panneau et feuille (rotation d'iPad, 768 ↔ 1024 px) : l'état reste juste, mais le focus retombe sur la page.
- Une sélection de texte par glisser peut fermer la feuille (clic sur le fond), surtout dans une fenêtre de bureau étroite.
- La bulle n'est mesurée qu'à l'ouverture et son débordement vers le bas n'est pas géré.
- Chaque `Sigle` lit tout le contexte du glossaire : tous se re-rendent à l'ouverture et à la fermeture, et chacun s'abonne à son propre `matchMedia`.
- Le titre de question (`h1`) contient la bulle : son nom accessible inclut la définition tant que la bulle est visible.
- Échap ne ferme pas le panneau latéral (non modal) ; seuls la bulle et la feuille réagissent.
- Le test des mentions neutres de partis (`app/glossaire.test.ts`) ne couvre qu'une liste de 5 sigles ; pour un nouveau parti, la consigne de rédaction fait foi.
