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
