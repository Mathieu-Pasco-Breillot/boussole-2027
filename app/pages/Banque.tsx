import { useEffect, useState } from 'react';
import { libelleTheme, THEMES } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { chargerPages } from './donnees.ts';
import type { Pages } from './donnees.ts';
import { Texte } from '../glossaire/Texte.tsx';

export function Banque({ onRetour }: { onRetour: () => void }) {
  const [pages, setPages] = useState<Pages | null>(null);
  useEffect(() => {
    void chargerPages().then(setPages);
  }, []);
  const horsJeu = pages?.horsJeu ?? [];

  return (
    <main className="conteneur flex max-w-4xl flex-col gap-4 py-8 leading-relaxed">
      <header>
        <button type="button" onClick={onRetour} className="lien">
          ← Retour
        </button>
        <h1 className="titre-page mt-2">Banque de questions</h1>
        <p className="mt-2 text-discret">
          {paquet.questions.length} questions actives, posées dans le quiz. Les questions suspendues ou archivées sont listées
          avec leur statut mais ne sont jamais posées.
        </p>
      </header>

      {Object.keys(THEMES).map((t) => {
        const actives = paquet.questions.filter((q) => q.theme === t);
        const autres = horsJeu.filter((q) => q.theme === t);
        return (
          <details key={t} className="depliant carte px-5 py-2">
            <summary className="font-titre text-xl font-bold">
              <span>
              {libelleTheme(t)} <span className="text-sm font-normal text-discret">· {actives.length} actives{autres.length ? `, ${autres.length} hors jeu` : ''}</span>
              </span>
            </summary>
            <ul className="mt-1 mb-3 flex flex-col gap-2.5 border-t border-trait pt-3 text-[0.95rem]">
              {actives.map((q) => (
                <li key={q.id}>
                  <span className="text-discret">{q.id}</span> · <Texte>{q.enonce}</Texte>
                </li>
              ))}
              {autres.map((q) => (
                <li key={q.id} className="text-discret">
                  {q.id} · <strong>{q.statut === 'suspendue' ? 'Suspendue' : 'Archivée'}</strong> · <Texte>{q.enonce}</Texte>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </main>
  );
}
