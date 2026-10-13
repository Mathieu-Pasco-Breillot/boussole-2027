import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { comportementDefilement, ETAT_INITIAL, idAncre, reduireGlossaire, type ActionGlossaire, type EtatGlossaire } from './etat.ts';

const connus = new Set(['TVA', 'UE']);
const r = (etat: EtatGlossaire, action: ActionGlossaire): EtatGlossaire => reduireGlossaire(connus, etat, action);
const suite = (...actions: ActionGlossaire[]): EtatGlossaire => actions.reduce(r, ETAT_INITIAL);
const ouvrir = (sigle: string): ActionGlossaire => ({ type: 'ouvrir', sigle });
const FERMER: ActionGlossaire = { type: 'fermer' };
const BASCULER: ActionGlossaire = { type: 'basculer' };

describe('reduireGlossaire', () => {
  it('fermé au départ', () => {
    expect(ETAT_INITIAL).toEqual({ ouvert: false, entree: null, demande: 0 });
  });
  it('ouvrir un sigle connu : ouvert sur son entrée', () => {
    expect(suite(ouvrir('TVA'))).toEqual({ ouvert: true, entree: 'TVA', demande: 1 });
  });
  it('ouvrir un sigle inconnu : ouvert, sans entrée mise en évidence', () => {
    expect(suite(ouvrir('XYZ'))).toEqual({ ouvert: true, entree: null, demande: 0 });
  });
  it('un sigle inconnu retire la mise en évidence précédente', () => {
    expect(suite(ouvrir('TVA'), ouvrir('XYZ'))).toEqual({ ouvert: true, entree: null, demande: 1 });
  });
  it('rouvrir le même sigle relance le défilement (demande incrémentée)', () => {
    expect(suite(ouvrir('TVA'), ouvrir('TVA'))).toEqual({ ouvert: true, entree: 'TVA', demande: 2 });
  });
  it('ouvrir un autre sigle, glossaire déjà ouvert : l’entrée change', () => {
    expect(suite(ouvrir('TVA'), ouvrir('UE'))).toEqual({ ouvert: true, entree: 'UE', demande: 2 });
  });
  it('fermer : plus d’entrée mise en évidence', () => {
    expect(suite(ouvrir('TVA'), FERMER)).toEqual({ ouvert: false, entree: null, demande: 1 });
  });
  it('fermer un glossaire fermé renvoie le même état (aucun rendu inutile)', () => {
    expect(r(ETAT_INITIAL, FERMER)).toBe(ETAT_INITIAL);
  });
  it('basculer : ouvre sans entrée, puis referme', () => {
    expect(suite(BASCULER)).toEqual({ ouvert: true, entree: null, demande: 0 });
    expect(suite(BASCULER, BASCULER)).toEqual({ ouvert: false, entree: null, demande: 0 });
    expect(suite(BASCULER, BASCULER, BASCULER)).toEqual({ ouvert: true, entree: null, demande: 0 });
  });
  it('basculer pendant une ouverture sur entrée : referme', () => {
    expect(suite(ouvrir('TVA'), BASCULER)).toEqual({ ouvert: false, entree: null, demande: 1 });
  });
  it('invariants, quelle que soit la suite d’actions', () => {
    const action = fc.oneof(
      fc.constantFrom('TVA', 'UE', 'XYZ', '').map(ouvrir),
      fc.constant(FERMER),
      fc.constant(BASCULER),
    );
    fc.assert(
      fc.property(fc.array(action, { maxLength: 40 }), (actions) => {
        let etat = ETAT_INITIAL;
        for (const a of actions) {
          const suivant = r(etat, a);
          expect(suivant.demande).toBeGreaterThanOrEqual(etat.demande);
          if (!suivant.ouvert) expect(suivant.entree).toBeNull();
          if (suivant.entree !== null) expect(connus.has(suivant.entree)).toBe(true);
          etat = suivant;
        }
      }),
    );
  });
});

describe('sélecteurs', () => {
  it('idAncre : identifiant d’ancre stable par sigle', () => {
    expect(idAncre('TVA')).toBe('glossaire-TVA');
    expect(idAncre('CE1')).toBe('glossaire-CE1');
  });
  it('comportementDefilement : instantané si les animations sont réduites, doux sinon', () => {
    expect(comportementDefilement(true)).toBe('auto');
    expect(comportementDefilement(false)).toBe('smooth');
  });
});
