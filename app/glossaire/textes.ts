/**
 * Textes que l'application affiche et annote avec <Texte> (issue #7), un élément par bloc de texte. Source unique
 * de l'inventaire (scripts/inventaire-glossaire.ts) et du test d'exhaustivité (app/glossaire.test.ts) : un écran qui
 * annote un nouveau champ doit l'ajouter ici. Sans DOM : lu par node.
 */
import type { Paquet } from '../paquet.ts';
import type { Pages } from '../pages/donnees.ts';

/** Ce que <Markdown> annote : ni le code en ligne, ni les liens (titre et adresse), qui ne reçoivent pas de bouton. */
export function texteAnnotableMarkdown(source: string): string {
  return source.replace(/`[^`]+`/g, ' ').replace(/\[[^\]]+\]\([^)]+\)/g, ' ');
}

/** Version anonymisée d'un extrait, montrée pendant la devinette du défi (scripts/bundle.ts). */
interface ExtraitDefi {
  reformulation_anonymisee?: string | null;
  citation_anonymisee?: string | null;
}

export function textesAffiches(paquet: Pick<Paquet, 'questions' | 'positions' | 'defi'>, pages: Pick<Pages, 'docs' | 'journal' | 'horsJeu'>): string[] {
  const textes: (string | null | undefined)[] = [];
  for (const q of paquet.questions) {
    textes.push(q.enonce, q.precision);
    if (q.impact) textes.push(q.impact.changement, q.impact.pour, q.impact.contre);
  }
  for (const liste of Object.values(paquet.positions)) {
    for (const p of liste) for (const e of p.extraits ?? []) textes.push(e.reformulation, e.citation);
  }
  for (const liste of Object.values(paquet.defi)) {
    for (const p of liste as { extraits: ExtraitDefi[] }[]) {
      for (const x of p.extraits) textes.push(x.reformulation_anonymisee, x.citation_anonymisee);
    }
  }
  for (const q of pages.horsJeu) textes.push(q.enonce);
  for (const e of pages.journal) textes.push(e.description);
  for (const d of Object.values(pages.docs)) textes.push(texteAnnotableMarkdown(d));
  return textes.filter((t): t is string => typeof t === 'string' && t !== '');
}
