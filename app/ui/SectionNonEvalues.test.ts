import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SectionNonEvalues } from './SectionNonEvalues.tsx';

const rendu = (nombre = 8) => renderToStaticMarkup(createElement(SectionNonEvalues, { nombre }, createElement('p', null, 'Contenu des motifs')));

describe('section « Non évalués » repliable', () => {
  it('est un <details> fermé par défaut', () => {
    const html = rendu();
    expect(html).toMatch(/^<details[ >]/);
    expect(html).not.toMatch(/<details[^>]*\bopen\b/);
  });

  it('garde le titre et le nombre de candidats visibles dans le <summary>', () => {
    const html = rendu(8);
    expect(html).toMatch(/<summary[^>]*>.*Non évalués.*\(8\).*<\/summary>/s);
  });

  it('garde le contenu dans le DOM, hors du <summary>, pour qu’il s’ouvre au clic', () => {
    const html = rendu();
    expect(html).toContain('Contenu des motifs');
    expect(html.indexOf('Contenu des motifs')).toBeGreaterThan(html.indexOf('</summary>'));
  });

  it('expose le titre comme un titre du niveau demandé', () => {
    const html = renderToStaticMarkup(createElement(SectionNonEvalues, { nombre: 1, niveau: 'h3' }, 'x'));
    expect(html).toMatch(/<h3[ >]/);
    expect(rendu()).toMatch(/<h2[ >]/);
  });
});
