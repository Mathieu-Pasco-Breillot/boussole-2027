import type { Versions } from '../core/versions.ts';

/** Injecté par Vite au moment de la compilation (vite.config.ts, `define`). */
declare const __VERSIONS__: Versions | undefined;

const DEPOT = 'https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027';

export const versions: Versions | null = typeof __VERSIONS__ === 'undefined' ? null : __VERSIONS__;

/** Notes de version GitHub d'un tag. */
export const lienNotes = (tag: string): string => `${DEPOT}/releases/tag/${tag}`;
/** Liste de toutes les versions publiées. */
export const LIEN_VERSIONS = `${DEPOT}/releases`;

/** « 2026-10-13 » → « 13 octobre 2026 ». */
export function dateLongue(iso: string): string {
  const [a, m, j] = iso.split('-').map(Number);
  const mois = new Date(Date.UTC(a!, m! - 1, j!)).toLocaleDateString('fr-FR', { month: 'long', timeZone: 'UTC' });
  return `${j === 1 ? '1er' : j} ${mois} ${a}`;
}

/** Libellé court : « Données v1.2.0 du 13 octobre 2026 », ou sans date si la version n'est pas encore publiée. */
export function libelleDonnees(v: Versions): string {
  const base = `Données v${v.donnees.version}`;
  return v.donnees.date ? `${base} du ${dateLongue(v.donnees.date)}` : base;
}
