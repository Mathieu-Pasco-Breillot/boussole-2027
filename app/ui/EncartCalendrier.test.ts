import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EncartCalendrier } from './EncartCalendrier.tsx';

const rendre = (maintenant: string) => renderToStaticMarkup(createElement(EncartCalendrier, { maintenant: new Date(maintenant) })).replaceAll('&#x27;', "'");

describe('EncartCalendrier', () => {
  it('affiche les quatre dates clés avec leur statut', () => {
    const html = rendre('2027-03-01T10:00:00Z');
    expect(html).toContain("Calendrier de l'élection");
    expect(html).toContain('Clôture du dépôt des parrainages');
    expect(html).toContain('12 mars 2027, 18 h');
    expect(html).toContain('Liste officielle des candidats');
    expect(html).toContain('au plus tard le 26 mars 2027');
    expect(html).toContain('1<sup>er</sup> tour');
    expect(html).toContain('2<sup>nd</sup> tour');
    expect(html).toContain('dimanche 18 avril 2027');
    expect(html).toContain('dimanche 2 mai 2027');
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html.match(/>officiel</g)).toHaveLength(2);
    expect(html.match(/calculé d'après la loi, à confirmer/g)).toHaveLength(2);
  });
  it('met les dates sur une colonne, puis deux à partir du breakpoint desktop', () => {
    const html = rendre('2027-03-01T10:00:00Z');
    expect(html).toMatch(/<ol[^>]*class="[^"]*\bgrid-cols-1\b[^"]*"/);
    expect(html).toMatch(/<ol[^>]*class="[^"]*\bmd:grid-cols-2\b[^"]*"/);
  });
  it('ne contient ni décompte ni minuteur', () => {
    expect(rendre('2027-03-01T10:00:00Z')).not.toContain('decompte');
  });
  it('après le 2nd tour, ne rend rien', () => {
    expect(rendre('2027-05-02T06:00:00Z')).toBe('');
  });
});
