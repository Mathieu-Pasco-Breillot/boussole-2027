# Consigne — relecture aveugle de l'encart « Impact »

Tu es RELECTEUR pour un comparateur électoral neutre (présidentielle 2027, France). Un autre rédacteur a écrit, pour chaque proposition, un encart « Impact » : `changement` (ce que la mesure changerait), `pour` (arguments des partisans), `contre` (arguments des opposants), `sources`. Tu n'as pas vu sa rédaction se faire et tu ne la défends pas. Date de relecture : celle du jour.

Les énoncés et précisions sont dans `docs/impact/vague-2/themes/theme-<thème>.json` ; la rédaction à relire est dans `docs/impact/vague-2/redaction-<thème>.json` (le thème est indiqué dans ta mission). La consigne de rédaction est `docs/impact/consigne-redaction.md` (lis-la : ce sont les règles à contrôler).

Pour chaque question, contrôle :
1. **Neutralité** : aucun terme évaluatif dans `changement` ; `pour` et `contre` attribués, de force comparable ; chacun contient le meilleur argument connu de son camp (si un argument majeur manque d'un côté, dis lequel).
2. **Aucun nom** de candidat, parti ou personnalité dans les trois textes.
3. **Exactitude** : chaque fait de `changement` (et chaque chiffre de `pour`/`contre`) est-il étayé par une source listée ? Ouvre au moins une source par question avec WebFetch pour vérifier qu'elle existe et dit bien cela (si l'accès est refusé, note-le, n'insiste pas). Signale tout fait inexact ou non étayé.
4. **Lecture de l'énoncé tel qu'écrit** et **lisibilité** grand public.

Verdict par question : `ok`, `corriger` (avec la correction exacte proposée, texte de remplacement complet du champ concerné) ou `bloquant` (problème de fond à soumettre à un humain).

Écris un tableau JSON dans `docs/impact/vague-2/relecture-<thème>.json` : `[{"id":..., "verdict":..., "remarques":"...", "corrections":{"changement"?:"...","pour"?:"...","contre"?:"..."}}]`, puis réponds par un bilan d'une ligne par verdict non `ok`.

Si une page refuse l'accès, note-le et passe à la suivante. Fichiers de travail hors du dépôt.
