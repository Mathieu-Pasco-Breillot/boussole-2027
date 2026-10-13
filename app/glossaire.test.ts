import { describe, expect, it } from 'vitest';
import { extraireSigles, indexer, segmenter } from '../core/glossaire/index.ts';
import pagesBrutes from './donnees/pages.json';
import { EXCEPTIONS_GLOSSAIRE } from './glossaire/exceptions.ts';
import { textesAffiches } from './glossaire/textes.ts';
import type { Pages } from './pages/donnees.ts';
import { paquet } from './paquet.ts';

/** Glossaire des sigles (issue #7) : exhaustivité et règles de contenu, sur le paquet et les pages générés. */

const pages = pagesBrutes as unknown as Pages;
const textes = textesAffiches(paquet, pages);
const auGlossaire = new Set(paquet.glossaire.flatMap((e) => [e.sigle, ...(e.formes ?? [])]));
const motsAffiches = new Set(textes.flatMap(extraireSigles));

/** Partis et mouvements cités dans les textes : mention neutre seulement (spec, « Règles »). */
const PARTIS = ['LFI', 'NFP', 'PCF', 'PS', 'RN'];
const MENTION_NEUTRE = /^(Parti|Mouvement) politique\.$/;

describe('glossaire', () => {
  it('chaque mot en capitales affiché a son entrée ou une exception (npm run glossaire:inventaire)', () => {
    const absents = [...motsAffiches].filter((m) => !auGlossaire.has(m) && !EXCEPTIONS_GLOSSAIRE.has(m)).sort();
    expect(absents).toEqual([]);
  });

  it('une exception n’est jamais aussi au glossaire, et reste utilisée', () => {
    const exceptions = [...EXCEPTIONS_GLOSSAIRE.keys()];
    expect(exceptions.filter((m) => auGlossaire.has(m))).toEqual([]);
    expect(exceptions.filter((m) => !motsAffiches.has(m))).toEqual([]);
  });

  it('les partis et mouvements ont la seule mention neutre', () => {
    const entrees = new Map(paquet.glossaire.map((e) => [e.sigle, e]));
    for (const sigle of PARTIS) {
      expect(entrees.get(sigle)?.explication, sigle).toMatch(MENTION_NEUTRE);
    }
  });

  it('aucun nom de candidat dans le glossaire', () => {
    const index = indexer(paquet.candidats.map((c) => ({ sigle: c.nom })));
    const fautifs = paquet.glossaire
      .filter((e) => segmenter(`${e.developpe} ${e.explication}`, index).some((s) => s.type === 'sigle'))
      .map((e) => e.sigle);
    expect(fautifs).toEqual([]);
  });

  it('« IP » (page Vie privée, texte en dur hors du paquet) a son entrée', () => {
    expect(auGlossaire.has('IP')).toBe(true);
  });
});
