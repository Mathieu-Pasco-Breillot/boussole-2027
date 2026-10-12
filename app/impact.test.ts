import { describe, expect, it } from 'vitest';
import { paquet } from './paquet.ts';

const avecImpact = paquet.questions.filter((q) => q.impact);

// Noms de famille et partis : l'encart Impact ne doit nommer ni candidat ni parti (consigne de rédaction, règle 2).
const noms = paquet.candidats.map((c) => c.nom);
const partis = [...new Set(paquet.candidats.map((c) => c.parti))];

describe('encart Impact', () => {
  it('pilote : toutes les questions actives du thème Institutions en ont un', () => {
    const institutions = paquet.questions.filter((q) => q.theme === 'institutions');
    expect(institutions.length).toBeGreaterThan(0);
    for (const q of institutions) expect(q.impact, q.id).toBeDefined();
  });

  it('chaque encart a ses trois textes et au moins une source', () => {
    for (const q of avecImpact) {
      expect(q.impact!.changement.length, q.id).toBeGreaterThan(0);
      expect(q.impact!.pour.length, q.id).toBeGreaterThan(0);
      expect(q.impact!.contre.length, q.id).toBeGreaterThan(0);
      expect(q.impact!.sources.length, q.id).toBeGreaterThan(0);
    }
  });

  it('aucun nom de candidat ni de parti dans les textes', () => {
    for (const q of avecImpact) {
      const texte = `${q.impact!.changement} ${q.impact!.pour} ${q.impact!.contre}`;
      for (const n of [...noms, ...partis]) expect(texte.includes(n), `${q.id} cite « ${n} »`).toBe(false);
    }
  });
});
