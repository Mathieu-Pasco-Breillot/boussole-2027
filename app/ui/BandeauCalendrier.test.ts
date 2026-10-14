import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BandeauCalendrier } from './BandeauCalendrier.tsx';

const rendre = (maintenant: string) => renderToStaticMarkup(createElement(BandeauCalendrier, { maintenant: new Date(maintenant) })).replaceAll('&#x27;', "'");

describe('BandeauCalendrier', () => {
  it('affiche le décompte du 1er tour et les quatre dates clés avec leur statut', () => {
    const html = rendre('2027-04-18T05:59:50Z');
    expect(html).toContain("Calendrier de l'élection");
    expect(html).toContain('Premier tour le dimanche 18 avril 2027');
    expect(html).toContain('Clôture du dépôt des parrainages');
    expect(html).toContain('12 mars 2027, 18 h');
    expect(html).toContain('Liste officielle des candidats');
    expect(html).toContain('au plus tard le 26 mars 2027');
    expect(html).toContain('dimanche 2 mai 2027');
    expect(html.match(/>officiel</g)).toHaveLength(2);
    expect(html.match(/calculé d'après la loi, à confirmer/g)).toHaveLength(2);
  });
  it('les chiffres sont masqués aux lecteurs d\'écran, sans aria-live', () => {
    const html = rendre('2027-04-18T05:59:50Z');
    expect(html).toMatch(/aria-hidden="true"[^>]*data-testid="decompte"|data-testid="decompte"[^>]*aria-hidden="true"/);
    expect(html).not.toContain('aria-live');
    expect(html).not.toContain('<h1');
  });
  it('après le 1er tour, le décompte vise le 2nd tour', () => {
    const html = rendre('2027-04-18T06:00:01Z');
    expect(html).toContain('Second tour le dimanche 2 mai 2027');
    expect(html).not.toContain('Premier tour le');
  });
  it('après le 2nd tour, ne rend rien', () => {
    expect(rendre('2027-05-02T06:00:00Z')).toBe('');
  });
});
