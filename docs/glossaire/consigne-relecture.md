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
