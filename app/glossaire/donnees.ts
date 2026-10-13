/** Glossaire du paquet, indexé une fois pour toute l'application (issue #7). */
import { indexer } from '../../core/glossaire/index.ts';
import type { Glossaire } from '../../core/types.generated.ts';
import { paquet } from '../paquet.ts';

export const ENTREES: ReadonlyMap<string, Glossaire.EntreeGlossaire> = new Map(paquet.glossaire.map((e) => [e.sigle, e]));
export const INDEX = indexer(paquet.glossaire);
