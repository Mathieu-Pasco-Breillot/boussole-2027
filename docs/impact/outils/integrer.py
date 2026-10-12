#!/usr/bin/env python3
"""Intègre dans data/questions/<thème>.json l'encart Impact d'un thème rédigé puis relu.

Usage (depuis la racine du dépôt) :
    python3 docs/impact/outils/integrer.py <thème> [--statut pilote|valide]

Lit docs/impact/vague-2/redaction-<thème>.json et docs/impact/vague-2/relecture-<thème>.json,
applique les corrections du relecteur, refuse d'intégrer s'il reste un verdict « bloquant »
ou une question sans source, puis réécrit le fichier de questions (indentation d'un espace,
comme les fichiers existants). Ajouter ensuite l'entrée de journal et lancer :
    npm run derive && npm run bundle && npm run check
"""
import json
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[3]
VAGUE = RACINE / 'docs/impact/vague-2'


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    theme = sys.argv[1]
    statut = sys.argv[3] if len(sys.argv) > 3 and sys.argv[2] == '--statut' else 'pilote'
    redaction = {x['id']: x for x in json.loads((VAGUE / f'redaction-{theme}.json').read_text())}
    relecture = {x['id']: x for x in json.loads((VAGUE / f'relecture-{theme}.json').read_text())}
    chemin = RACINE / f'data/questions/{theme}.json'
    donnees = json.loads(chemin.read_text())

    erreurs = []
    bilan = {'ok': 0, 'corriger': 0}
    for q in donnees['questions']:
        if q['statut'] != 'active':
            continue
        qid = q['id']
        if qid not in redaction or qid not in relecture:
            erreurs.append(f'{qid} : rédaction ou relecture manquante')
            continue
        verdict = relecture[qid]['verdict']
        if verdict == 'bloquant':
            erreurs.append(f'{qid} : verdict bloquant ({relecture[qid].get("remarques", "")})')
            continue
        bilan[verdict] += 1
        r = dict(redaction[qid])
        for champ, texte in (relecture[qid].get('corrections') or {}).items():
            if champ in ('changement', 'pour', 'contre'):
                r[champ] = texte
        if not r.get('sources'):
            erreurs.append(f'{qid} : aucune source')
            continue
        q['impact'] = {
            'changement': r['changement'],
            'pour': r['pour'],
            'contre': r['contre'],
            'sources': [{k: s[k] for k in ('url', 'titre', 'date_consultation', 'nature')} for s in r['sources']],
            'statut': statut,
        }

    if erreurs:
        sys.exit('Intégration refusée :\n- ' + '\n- '.join(erreurs))
    chemin.write_text(json.dumps(donnees, ensure_ascii=False, indent=1) + '\n')
    print(f'{theme} : {bilan["ok"]} ok, {bilan["corriger"]} corrigées, intégrées avec le statut « {statut} ».')


if __name__ == '__main__':
    main()
