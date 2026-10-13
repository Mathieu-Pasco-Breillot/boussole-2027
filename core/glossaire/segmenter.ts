/**
 * Découpage d'un texte en segments « texte » et « sigle » (issue #7). Fonction pure, sans DOM : l'interface
 * (app/glossaire/Texte.tsx) rend chaque segment « sigle » comme un bouton.
 *
 * Correspondance exacte, sensible à la casse, sur mots entiers : un sigle n'est reconnu que s'il n'est ni précédé
 * ni suivi d'une lettre ou d'un chiffre (« UE » n'est pas reconnu dans « UEFA », ni « EPR » dans « EPR2 »).
 * L'apostrophe, droite ou typographique, n'est ni une lettre ni un chiffre : « l’OTAN » est reconnu.
 */

/** Ce que le découpage lit d'une entrée du glossaire. */
export interface EntreeASegmenter {
  sigle: string;
  /** Autres écritures reconnues pour ce sigle (casse, variante chiffrée). */
  formes?: readonly string[];
}

/** Index construit une fois pour tout le glossaire (indexer), puis réutilisé à chaque appel de segmenter. */
export interface IndexGlossaire {
  /** Toutes les écritures, la plus longue d'abord ; null si le glossaire est vide. */
  motif: RegExp | null;
  /** Écriture reconnue → sigle de son entrée. */
  sigleDeForme: ReadonlyMap<string, string>;
}

export type Segment =
  | { type: 'texte'; texte: string }
  /** `premiere` : première occurrence de ce sigle dans le texte découpé (toutes écritures confondues). */
  | { type: 'sigle'; texte: string; sigle: string; premiere: boolean };

const echapper = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function indexer(entrees: readonly EntreeASegmenter[]): IndexGlossaire {
  const sigleDeForme = new Map<string, string>();
  for (const e of entrees) {
    for (const forme of [e.sigle, ...(e.formes ?? [])]) if (!sigleDeForme.has(forme)) sigleDeForme.set(forme, e.sigle);
  }
  // La plus longue d'abord (« PLFSS » avant « PLF ») ; à longueur égale, ordre stable.
  const formes = [...sigleDeForme.keys()].sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0));
  const motif =
    formes.length === 0 ? null : new RegExp(`(?<![\\p{L}\\p{N}])(?:${formes.map(echapper).join('|')})(?![\\p{L}\\p{N}])`, 'gu');
  return { motif, sigleDeForme };
}

export function segmenter(texte: string, index: IndexGlossaire): Segment[] {
  if (texte === '') return [];
  if (!index.motif) return [{ type: 'texte', texte }];
  const segments: Segment[] = [];
  const vus = new Set<string>();
  let curseur = 0;
  for (const m of texte.matchAll(index.motif)) {
    const debut = m.index;
    if (debut > curseur) segments.push({ type: 'texte', texte: texte.slice(curseur, debut) });
    const sigle = index.sigleDeForme.get(m[0])!;
    segments.push({ type: 'sigle', texte: m[0], sigle, premiere: !vus.has(sigle) });
    vus.add(sigle);
    curseur = debut + m[0].length;
  }
  if (curseur < texte.length) segments.push({ type: 'texte', texte: texte.slice(curseur) });
  return segments;
}
