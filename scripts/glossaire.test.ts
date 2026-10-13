import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { chargerDataset } from './lib/dataset.ts';
import { paquetGlossaire } from './lib/glossaire.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const e = (sigle: string, formes?: string[]) => ({
  sigle,
  developpe: `${sigle} en toutes lettres`,
  explication: 'Une phrase courte.',
  ...(formes ? { formes } : {}),
});

describe('paquetGlossaire', () => {
  it('trie par ordre alphabétique français (une lettre accentuée au rang de sa lettre de base)', () => {
    expect(paquetGlossaire([e('UE'), e('ÉTA'), e('ZAN'), e('EDF')]).map((x) => x.sigle)).toEqual(['EDF', 'ÉTA', 'UE', 'ZAN']);
  });
  it('range les chiffres avant les lettres', () => {
    expect(paquetGlossaire([e('CEDH'), e('CE2'), e('CE1')]).map((x) => x.sigle)).toEqual(['CE1', 'CE2', 'CEDH']);
  });
  it('garde les formes, et n’ajoute pas de clé formes absente', () => {
    const [avec, sans] = paquetGlossaire([e('LBD', ['LBD40']), e('PIB')]);
    expect(avec).toEqual(e('LBD', ['LBD40']));
    expect(sans).toEqual(e('PIB'));
    expect('formes' in sans!).toBe(false);
  });
  it('ne modifie pas le tableau reçu', () => {
    const entrees = [e('UE'), e('EDF')];
    paquetGlossaire(entrees);
    expect(entrees.map((x) => x.sigle)).toEqual(['UE', 'EDF']);
  });
  it('le paquet de l’application contient le glossaire trié (sinon : npm run bundle)', () => {
    const paquet = JSON.parse(readFileSync(join(racine, 'app', 'donnees', 'paquet.json'), 'utf8'));
    expect(paquet.glossaire).toEqual(paquetGlossaire(chargerDataset(racine).glossaire));
  });
});
