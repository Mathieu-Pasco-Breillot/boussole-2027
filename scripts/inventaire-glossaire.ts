/**
 * Inventaire des mots en capitales des textes affichés (issue #7) : `npm run glossaire:inventaire`.
 * Sortie TSV sur stdout (mot, occurrences, statut, premier contexte), triée par statut puis par mot ; résumé sur
 * stderr. Statuts : glossaire (sigle ou forme d'une entrée), exception (app/glossaire/exceptions.ts), absent (à
 * ajouter au glossaire ou aux exceptions : app/glossaire.test.ts échoue tant qu'il en reste).
 * Lit le paquet et les pages produits par `npm run bundle` : relancer le bundle après une modification de data/.
 */
import { readFileSync } from 'node:fs';
import { extraireSigles } from '../core/glossaire/index.ts';
import { EXCEPTIONS_GLOSSAIRE } from '../app/glossaire/exceptions.ts';
import { textesAffiches } from '../app/glossaire/textes.ts';
import type { Paquet } from '../app/paquet.ts';
import type { Pages } from '../app/pages/donnees.ts';

const lire = <T>(chemin: string): T => JSON.parse(readFileSync(new URL(`../${chemin}`, import.meta.url), 'utf8')) as T;
const paquet = lire<Paquet>('app/donnees/paquet.json');
const pages = lire<Pages>('app/donnees/pages.json');

const auGlossaire = new Set(paquet.glossaire.flatMap((e) => [e.sigle, ...(e.formes ?? [])]));
const mots = new Map<string, { n: number; contexte: string }>();
for (const texte of textesAffiches(paquet, pages)) {
  for (const mot of extraireSigles(texte)) {
    const m = mots.get(mot);
    if (m) m.n++;
    else {
      const i = texte.indexOf(mot);
      mots.set(mot, { n: 1, contexte: texte.slice(Math.max(0, i - 40), i + mot.length + 40).replace(/\s+/g, ' ') });
    }
  }
}

const ORDRE = { absent: 0, exception: 1, glossaire: 2 } as const;
type Statut = keyof typeof ORDRE;
const statut = (mot: string): Statut => (auGlossaire.has(mot) ? 'glossaire' : EXCEPTIONS_GLOSSAIRE.has(mot) ? 'exception' : 'absent');
const lignes = [...mots.entries()].sort(([a], [b]) => ORDRE[statut(a)] - ORDRE[statut(b)] || a.localeCompare(b, 'fr'));
console.log('mot\toccurrences\tstatut\tcontexte');
for (const [mot, { n, contexte }] of lignes) console.log(`${mot}\t${n}\t${statut(mot)}\t${contexte}`);
const compte = (s: Statut): number => lignes.filter(([m]) => statut(m) === s).length;
console.error(`${lignes.length} mots en capitales : ${compte('glossaire')} au glossaire, ${compte('exception')} exceptions, ${compte('absent')} absents`);
