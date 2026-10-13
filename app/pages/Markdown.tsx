/**
 * Rendu Markdown minimal (titres, paragraphes, listes, citations, tableaux, gras, italique, code, liens http).
 * Écrit pour les documents du dépôt ; pas de HTML brut, donc rien d'injecté dans la page.
 * Les sigles du glossaire sont annotés (<Segments>). Un paragraphe, un item, une cellule ou un titre forme un bloc :
 * le (i) ne marque que la première occurrence d'un sigle par bloc, gras et italique compris.
 */
import { Fragment, type ReactNode } from 'react';
import { decouper, Segments } from '../glossaire/Texte.tsx';

function enLigne(texte: string): ReactNode[] {
  const motif = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/g;
  const vus = new Set<string>();
  // Les morceaux sont découpés ici, dans l'ordre, et non au rendu des enfants : le rendu doit rester pur.
  const sigles = (morceau: string) => <Segments segments={decouper(morceau, vus)} />;
  return texte.split(motif).map((morceau, i) => {
    if (/^\*\*.+\*\*$/.test(morceau)) return <strong key={i}>{sigles(morceau.slice(2, -2))}</strong>;
    if (/^`.+`$/.test(morceau)) return <code key={i} className="rounded bg-fond px-1 text-[0.9em]">{morceau.slice(1, -1)}</code>;
    if (/^\*.+\*$/.test(morceau)) return <em key={i}>{sigles(morceau.slice(1, -1))}</em>;
    const lien = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(morceau);
    if (lien) {
      return /^https?:\/\//.test(lien[2]!) ? (
        <a key={i} className="underline" href={lien[2]} target="_blank" rel="noopener noreferrer">
          {lien[1]}
        </a>
      ) : (
        <span key={i}>{lien[1]}</span>
      );
    }
    // Texte brut : sigles annotés. Le code et les titres de liens ne le sont pas (pas de bouton dans un lien).
    return <Fragment key={i}>{sigles(morceau)}</Fragment>;
  });
}

const cellules = (ligne: string): string[] => ligne.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function Markdown({ source }: { source: string }) {
  const lignes = source.replace(/\r/g, '').split('\n');
  const blocs: ReactNode[] = [];
  let i = 0;
  while (i < lignes.length) {
    const l = lignes[i]!;
    if (l.trim() === '') { i++; continue; }
    const titre = /^(#{1,4})\s+(.*)$/.exec(l);
    if (titre) {
      const n = titre[1]!.length;
      const classe = n === 1 ? 'mt-2 font-titre text-3xl font-semibold' : n === 2 ? 'mt-4 font-titre text-2xl font-bold tracking-tight' : 'mt-3 font-titre text-xl font-bold';
      blocs.push(n === 1 ? <h2 key={i} className={classe}>{enLigne(titre[2]!)}</h2> : <h3 key={i} className={classe}>{enLigne(titre[2]!)}</h3>);
      i++; continue;
    }
    if (l.trim().startsWith('|')) {
      const bloc: string[] = [];
      while (i < lignes.length && lignes[i]!.trim().startsWith('|')) bloc.push(lignes[i++]!);
      const [entete, , ...corps] = bloc;
      blocs.push(
        <div key={i} className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>{cellules(entete!).map((c, k) => <th key={k} scope="col" className="border-b border-accent/40 px-2 py-1 align-bottom">{enLigne(c)}</th>)}</tr>
            </thead>
            <tbody>
              {corps.map((r, a) => <tr key={a}>{cellules(r).map((c, k) => <td key={k} className="border-b border-trait px-2 py-1 align-top">{enLigne(c)}</td>)}</tr>)}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ordonnee = /^\s*\d+\./.test(l);
      const items: string[] = [];
      while (i < lignes.length && /^\s*([-*]|\d+\.)\s+/.test(lignes[i]!)) items.push(lignes[i++]!.replace(/^\s*([-*]|\d+\.)\s+/, ''));
      const Liste = ordonnee ? 'ol' : 'ul';
      blocs.push(<Liste key={i} className={`${ordonnee ? 'list-decimal' : 'list-disc'} ml-6 flex flex-col gap-1`}>{items.map((t, k) => <li key={k}>{enLigne(t)}</li>)}</Liste>);
      continue;
    }
    if (l.startsWith('>')) {
      const citation: string[] = [];
      while (i < lignes.length && lignes[i]!.startsWith('>')) citation.push(lignes[i++]!.replace(/^>\s?/, ''));
      blocs.push(<blockquote key={i} className="border-l-2 border-accent/60 pl-3 text-discret">{enLigne(citation.join(' '))}</blockquote>);
      continue;
    }
    const para: string[] = [];
    while (i < lignes.length && lignes[i]!.trim() !== '' && !/^(#{1,4}\s|\||>|\s*([-*]|\d+\.)\s)/.test(lignes[i]!)) para.push(lignes[i++]!);
    blocs.push(<p key={i}>{enLigne(para.join(' '))}</p>);
  }
  return <div className="flex flex-col gap-3 leading-relaxed">{blocs}</div>;
}
