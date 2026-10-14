import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CompteARebours } from './CompteARebours.tsx';

const rendre = (maintenant: string) => renderToStaticMarkup(createElement(CompteARebours, { maintenant: new Date(maintenant) })).replaceAll('&#x27;', "'");

describe('CompteARebours', () => {
  it('affiche le titre du 1er tour et la phrase statique avec la date', () => {
    const html = rendre('2027-04-18T05:59:50Z');
    expect(html).toContain("1<sup>er</sup> tour de l'élection présidentielle de 2027");
    expect(html).toContain('<sup>er</sup>');
    expect(html).toContain('Premier tour le dimanche 18 avril 2027');
    expect(html).toContain("jusqu'à l'ouverture des bureaux de vote, à 8 h (heure de Paris)");
  });
  it('les chiffres sont masqués aux lecteurs d\'écran, sans aria-live', () => {
    const html = rendre('2027-04-18T05:59:50Z');
    expect(html).toMatch(/aria-hidden="true"[^>]*data-testid="decompte"|data-testid="decompte"[^>]*aria-hidden="true"/);
    expect(html).not.toContain('aria-live');
  });
  it('placé avant le h1 : aucun titre (h1 à h6) dans le widget', () => {
    expect(rendre('2027-04-18T05:59:50Z')).not.toMatch(/<h[1-6]/);
  });
  it('après le 1er tour, le titre et le décompte visent le 2nd tour', () => {
    const html = rendre('2027-04-18T06:00:01Z');
    expect(html).toContain("2<sup>nd</sup> tour de l'élection présidentielle de 2027");
    expect(html).toContain('Second tour le dimanche 2 mai 2027');
    expect(html).not.toContain('1er tour de');
  });
  it('après le 2nd tour, ne rend rien', () => {
    expect(rendre('2027-05-02T06:00:00Z')).toBe('');
  });
});
