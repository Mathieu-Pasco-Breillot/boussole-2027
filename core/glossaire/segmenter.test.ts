import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { indexer, segmenter, type Segment } from './index.ts';

const index = indexer([
  { sigle: 'PLF' },
  { sigle: 'PLFSS' },
  { sigle: 'UE' },
  { sigle: 'AN' },
  { sigle: 'OTAN' },
  { sigle: 'TVA' },
  { sigle: 'CESEDA', formes: ['Ceseda'] },
  { sigle: 'EPR' },
  { sigle: 'LBD', formes: ['LBD40'] },
]);
const sigles = (segments: Segment[]): string[] => segments.flatMap((s) => (s.type === 'sigle' ? [s.texte] : []));

describe('segmenter : cas limites', () => {
  it('texte vide : aucun segment', () => {
    expect(segmenter('', index)).toEqual([]);
  });
  it('glossaire vide : un seul segment de texte', () => {
    expect(segmenter('La TVA', indexer([]))).toEqual([{ type: 'texte', texte: 'La TVA' }]);
  });
  it('sigle seul (début et fin de texte confondus)', () => {
    expect(segmenter('TVA', index)).toEqual([{ type: 'sigle', texte: 'TVA', sigle: 'TVA', premiere: true }]);
  });
  it('sigles en début et en fin de texte', () => {
    expect(segmenter('TVA et UE', index)).toEqual([
      { type: 'sigle', texte: 'TVA', sigle: 'TVA', premiere: true },
      { type: 'texte', texte: ' et ' },
      { type: 'sigle', texte: 'UE', sigle: 'UE', premiere: true },
    ]);
  });
  it('accents et chiffres autour, hors du sigle', () => {
    expect(segmenter('Hausse de TVA à 20 %', index)).toEqual([
      { type: 'texte', texte: 'Hausse de ' },
      { type: 'sigle', texte: 'TVA', sigle: 'TVA', premiere: true },
      { type: 'texte', texte: ' à 20 %' },
    ]);
  });
});

describe('segmenter : bornes', () => {
  it.each(['(TVA)', 'TVA,', 'TVA.', 'TVA;', '« TVA »', '« TVA »', 'TVA\n'])('collé à la ponctuation : %j', (texte) => {
    expect(sigles(segmenter(texte, index))).toEqual(['TVA']);
  });
  it.each([['TVA/UE'], ['TVA-UE'], ['TVA\nUE']])('deux sigles séparés par un signe : %j', (texte) => {
    expect(sigles(segmenter(texte, index))).toEqual(['TVA', 'UE']);
  });
  it('apostrophe droite et apostrophe typographique', () => {
    expect(segmenter('l’OTAN', index)).toEqual([
      { type: 'texte', texte: 'l’' },
      { type: 'sigle', texte: 'OTAN', sigle: 'OTAN', premiere: true },
    ]);
    expect(sigles(segmenter("l'OTAN", index))).toEqual(['OTAN']);
    expect(sigles(segmenter('d’UE', index))).toEqual(['UE']);
  });
  it.each(['UEFA', 'QUEUE', 'ANNÉE', 'PLANS', 'EPR2', '2TVA', 'TVAs', 'éUE', 'UEé'])(
    'sigle contenu dans un mot plus long, ou collé à une lettre ou un chiffre : rien (%j)',
    (texte) => {
      expect(sigles(segmenter(texte, index))).toEqual([]);
    },
  );
  it('casse exacte : « tva », « Tva », « uE » ne sont pas reconnus', () => {
    expect(sigles(segmenter('tva, Tva, uE', index))).toEqual([]);
  });
});

describe('segmenter : formes', () => {
  it('la forme la plus longue d’abord', () => {
    expect(segmenter('Le PLFSS et le PLF', index).filter((s) => s.type === 'sigle')).toEqual([
      { type: 'sigle', texte: 'PLFSS', sigle: 'PLFSS', premiere: true },
      { type: 'sigle', texte: 'PLF', sigle: 'PLF', premiere: true },
    ]);
  });
  it('une variante est rattachée à son sigle, et compte comme lui pour la première occurrence', () => {
    expect(segmenter('Le Ceseda (CESEDA) et le LBD40', index)).toEqual([
      { type: 'texte', texte: 'Le ' },
      { type: 'sigle', texte: 'Ceseda', sigle: 'CESEDA', premiere: true },
      { type: 'texte', texte: ' (' },
      { type: 'sigle', texte: 'CESEDA', sigle: 'CESEDA', premiere: false },
      { type: 'texte', texte: ') et le ' },
      { type: 'sigle', texte: 'LBD40', sigle: 'LBD', premiere: true },
    ]);
  });
  it('les caractères spéciaux d’une forme sont pris littéralement', () => {
    const special = indexer([{ sigle: 'A.B' }]);
    expect(segmenter('AxB', special)).toEqual([{ type: 'texte', texte: 'AxB' }]);
    expect(sigles(segmenter('A.B', special))).toEqual(['A.B']);
  });
});

describe('segmenter : première occurrence', () => {
  it('vrai à la première occurrence de chaque sigle seulement', () => {
    const premieres = segmenter('TVA, UE, TVA, UE, OTAN', index).flatMap((s) => (s.type === 'sigle' ? [s.premiere] : []));
    expect(premieres).toEqual([true, true, false, false, true]);
  });
  it('un bloc découpé en plusieurs morceaux partage ses sigles déjà vus', () => {
    const vus = new Set<string>();
    const premieres = ['la TVA et l’UE', ' puis la TVA', ' et l’OTAN, l’UE']
      .flatMap((morceau) => segmenter(morceau, index, vus))
      .flatMap((s) => (s.type === 'sigle' ? [`${s.sigle}:${s.premiere}`] : []));
    expect(premieres).toEqual(['TVA:true', 'UE:true', 'TVA:false', 'OTAN:true', 'UE:false']);
  });
  it('chaque appel repart de zéro', () => {
    expect(segmenter('TVA', index)).toEqual(segmenter('TVA', index));
    expect(segmenter('TVA', index)[0]).toMatchObject({ premiere: true });
  });
});

describe('segmenter : propriétés', () => {
  const morceaux = fc.constantFrom('TVA', 'UE', 'PLF', 'PLFSS', 'Ceseda', 'LBD40', 'l’', "l'", 'a', 'É', 'é', ' ', ' ', '2', ',', '(', ')');
  const textes = fc.array(morceaux, { maxLength: 30 }).map((m) => m.join(''));

  it('les segments recollés redonnent le texte, sans segment de texte vide', () => {
    fc.assert(
      fc.property(textes, (texte) => {
        const s = segmenter(texte, index);
        expect(s.map((x) => x.texte).join('')).toBe(texte);
        expect(s.some((x) => x.type === 'texte' && x.texte === '')).toBe(false);
      }),
    );
  });
  it('tout segment « sigle » désigne une entrée du glossaire, et un seul est « premier » par sigle', () => {
    fc.assert(
      fc.property(textes, (texte) => {
        const s = segmenter(texte, index).filter((x) => x.type === 'sigle');
        for (const x of s) expect(index.sigleDeForme.get(x.texte)).toBe(x.sigle);
        const premiers = s.filter((x) => x.premiere).map((x) => x.sigle);
        expect(new Set(premiers).size).toBe(premiers.length);
        expect(new Set(premiers)).toEqual(new Set(s.map((x) => x.sigle)));
      }),
    );
  });
});
