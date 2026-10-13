import { describe, expect, it } from 'vitest';
import { idOnglet, idPanneau, ongletVoisin } from './onglets.ts';

describe('navigation au clavier des onglets', () => {
  it('passe à l’onglet suivant ou précédent, avec retour au bout', () => {
    expect(ongletVoisin(0, 'ArrowRight', 2)).toBe(1);
    expect(ongletVoisin(1, 'ArrowRight', 2)).toBe(0);
    expect(ongletVoisin(0, 'ArrowLeft', 2)).toBe(1);
    expect(ongletVoisin(2, 'ArrowLeft', 3)).toBe(1);
  });

  it('va au premier ou au dernier onglet avec Début et Fin', () => {
    expect(ongletVoisin(1, 'Home', 4)).toBe(0);
    expect(ongletVoisin(1, 'End', 4)).toBe(3);
  });

  it('ignore les autres touches et une liste vide', () => {
    expect(ongletVoisin(0, 'Enter', 2)).toBeNull();
    expect(ongletVoisin(0, 'a', 2)).toBeNull();
    expect(ongletVoisin(0, 'ArrowRight', 0)).toBeNull();
  });

  it('relie un onglet à son panneau par des identifiants distincts', () => {
    expect(idOnglet('jouer', 'quiz')).not.toBe(idPanneau('jouer', 'quiz'));
    expect(idPanneau('jouer', 'duel')).toBe('jouer-panneau-duel');
  });
});
