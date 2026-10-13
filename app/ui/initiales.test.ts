import { describe, expect, it } from 'vitest';
import { initiales } from './initiales.ts';

describe('initiales', () => {
  it('prend la première lettre du prénom et du nom', () => {
    expect(initiales('Marine', 'Tondelier')).toBe('MT');
    expect(initiales('Jean-Luc', 'Mélenchon')).toBe('JM');
  });

  it('met en majuscules, accents compris, et ignore les espaces autour', () => {
    expect(initiales(' édouard', ' philippe ')).toBe('ÉP');
  });

  it('ne plante pas sur un champ vide', () => {
    expect(initiales('', 'Nom')).toBe('N');
    expect(initiales('', '')).toBe('');
  });
});
