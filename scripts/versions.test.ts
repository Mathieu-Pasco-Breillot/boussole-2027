import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { datePublication, lireVersions } from './lib/versions.ts';

describe('datePublication', () => {
  const changelog = [
    '# Changelog',
    '',
    '## [1.2.0](https://github.com/o/r/compare/donnees-v1.1.0...donnees-v1.2.0) (2026-10-20)',
    '',
    '### Corrections de codage',
    '',
    '## [1.1.0](https://github.com/o/r/compare/donnees-v1.0.0...donnees-v1.1.0) (2026-10-15)',
    '',
    '## 1.0.0 (2026-10-13)',
  ].join('\n');

  it('lit la date de la version demandée', () => {
    expect(datePublication(changelog, '1.2.0')).toBe('2026-10-20');
    expect(datePublication(changelog, '1.1.0')).toBe('2026-10-15');
    expect(datePublication(changelog, '1.0.0')).toBe('2026-10-13');
  });

  it("renvoie null pour une version absente, sans confondre 1.0.0 et 1.0.0x ou 1x0x0", () => {
    expect(datePublication(changelog, '2.0.0')).toBeNull();
    expect(datePublication('## [1.0.01](u) (2026-01-01)', '1.0.0')).toBeNull();
    expect(datePublication('## [1a0b0](u) (2026-01-01)', '1.0.0')).toBeNull();
  });
});

describe('lireVersions', () => {
  const depot = (): string => {
    const r = mkdtempSync(join(tmpdir(), 'versions-'));
    mkdirSync(join(r, 'data'));
    writeFileSync(join(r, '.release-please-manifest.json'), JSON.stringify({ '.': '1.3.0', data: '2.1.0' }));
    writeFileSync(join(r, 'data', 'CHANGELOG.md'), '# Changelog\n\n## [2.1.0](u) (2026-11-02)\n');
    return r;
  };

  it('lit les versions du manifeste, la date du CHANGELOG et le canal', () => {
    const v = lireVersions(depot(), { CANAL: 'preprod', RAILWAY_GIT_COMMIT_SHA: '0123456789abcdef' });
    expect(v.donnees).toEqual({ version: '2.1.0', date: '2026-11-02', tag: 'donnees-v2.1.0' });
    // Pas de CHANGELOG à la racine : version connue, date inconnue.
    expect(v.application).toEqual({ version: '1.3.0', date: null, tag: 'application-v1.3.0' });
    expect(v.canal).toBe('preprod');
    expect(v.commit).toBe('0123456');
  });

  it('suppose la production et aucun commit quand les variables sont absentes', () => {
    const v = lireVersions(depot(), {});
    expect(v.canal).toBe('production');
    expect(v.commit).toBeNull();
  });

  it('lit le vrai manifeste du dépôt', () => {
    const v = lireVersions(process.cwd(), {});
    expect(v.donnees.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(v.application.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
