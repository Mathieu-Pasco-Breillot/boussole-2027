import { describe, expect, it } from 'vitest';
import { extraireSigles } from './index.ts';

describe('extraireSigles', () => {
  it('relève les mots d’au moins deux majuscules, chiffres compris', () => {
    expect(extraireSigles('La TVA et l’OTAN, le CO2 et le CE1')).toEqual(['TVA', 'OTAN', 'CO2', 'CE1']);
  });
  it('ignore les mots d’une seule majuscule (articles de loi, numéros, noms propres)', () => {
    expect(extraireSigles('Article L136 ou D1, A69 et Paris')).toEqual([]);
  });
  it('relève les capitales accentuées', () => {
    expect(extraireSigles('VALIDÉ le 3 octobre')).toEqual(['VALIDÉ']);
  });
  it('ignore un mot en capitales collé à une minuscule', () => {
    expect(extraireSigles('des PMEs')).toEqual([]);
  });
  it('garde chaque occurrence, dans l’ordre', () => {
    expect(extraireSigles('TVA puis SP95-E10 puis TVA')).toEqual(['TVA', 'SP95', 'TVA']);
  });
  it('texte vide : rien', () => {
    expect(extraireSigles('')).toEqual([]);
  });
});
