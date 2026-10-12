import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VersionComposant, Versions } from '../../core/versions.ts';

export type { VersionComposant, Versions };

/**
 * Date de publication d'une version dans un CHANGELOG produit par release-please : première ligne de titre
 * « ## [1.2.0](https://…) (2026-10-13) » ou « ## 1.2.0 (2026-10-13) » portant ce numéro de version.
 */
export function datePublication(changelog: string, version: string): string | null {
  const echappee = version.replace(/[.+]/g, '\\$&');
  const motif = new RegExp(`^#{2,3} \\[?${echappee}\\]?(?:\\([^)]*\\))?\\s+\\((\\d{4}-\\d{2}-\\d{2})\\)`, 'm');
  return motif.exec(changelog)?.[1] ?? null;
}

const lireTexte = (chemin: string): string => (existsSync(chemin) ? readFileSync(chemin, 'utf8') : '');

/** Lit les versions dans le manifeste de release-please (source unique) et les dates dans les CHANGELOG. */
export function lireVersions(racine: string, env: Record<string, string | undefined> = process.env): Versions {
  const manifeste = JSON.parse(readFileSync(join(racine, '.release-please-manifest.json'), 'utf8')) as Record<string, string>;
  const composant = (chemin: string, nom: string): VersionComposant => {
    const version = manifeste[chemin];
    if (!version) throw new Error(`.release-please-manifest.json : aucune version pour « ${chemin} »`);
    const changelog = lireTexte(join(racine, chemin, 'CHANGELOG.md'));
    return { version, date: datePublication(changelog, version), tag: `${nom}-v${version}` };
  };
  const commit = env.RAILWAY_GIT_COMMIT_SHA?.trim();
  return {
    donnees: composant('data', 'donnees'),
    application: composant('.', 'application'),
    canal: env.CANAL === 'preprod' ? 'preprod' : 'production',
    commit: commit ? commit.slice(0, 7) : null,
  };
}
