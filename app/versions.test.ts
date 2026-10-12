import { describe, expect, it } from 'vitest';
import { dateLongue, libelleDonnees, lienNotes } from './versions.ts';
import type { Versions } from '../core/versions.ts';

const v = (date: string | null): Versions => ({
  donnees: { version: '1.2.0', date, tag: 'donnees-v1.2.0' },
  application: { version: '1.0.0', date: null, tag: 'application-v1.0.0' },
  canal: 'production',
  commit: null,
});

describe('versions affichées', () => {
  it('formate la date en français', () => {
    expect(dateLongue('2026-10-13')).toBe('13 octobre 2026');
    expect(dateLongue('2027-03-01')).toBe('1er mars 2027');
  });
  it('libellé avec et sans date', () => {
    expect(libelleDonnees(v('2026-10-13'))).toBe('Données v1.2.0 du 13 octobre 2026');
    expect(libelleDonnees(v(null))).toBe('Données v1.2.0');
  });
  it('lien vers les notes de version du tag', () => {
    expect(lienNotes('donnees-v1.2.0')).toBe(
      'https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027/releases/tag/donnees-v1.2.0',
    );
  });
});
