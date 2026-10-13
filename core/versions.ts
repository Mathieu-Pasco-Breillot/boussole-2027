/** Version publiée d'un composant (données ou application), lue au moment de la compilation. */
export interface VersionComposant {
  version: string;
  /** Date de publication (AAAA-MM-JJ) lue dans le CHANGELOG, ou null si cette version n'a pas encore été publiée. */
  date: string | null;
  /** Tag GitHub de la version (ex. « donnees-v1.2.0 »). */
  tag: string;
}

/** Versions compilées dans le site (scripts/lib/versions.ts les lit, vite.config.ts les injecte). */
export interface Versions {
  donnees: VersionComposant;
  application: VersionComposant;
  /** « production » pour la branche main, « preprod » pour develop (variable CANAL, définie sur Railway). */
  canal: 'production' | 'preprod';
  /** Commit compilé, quand l'hébergeur le fournit (RAILWAY_GIT_COMMIT_SHA). */
  commit: string | null;
}
