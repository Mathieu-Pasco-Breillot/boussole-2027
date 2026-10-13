import { useEffect, useState } from 'react';
import { libelleTheme, THEMES } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { chargerPages } from './donnees.ts';
import type { Pages } from './donnees.ts';
import { Texte } from '../glossaire/Texte.tsx';
import { EntetePage } from '../ui/EntetePage.tsx';

export function Banque({ onRetour }: { onRetour: () => void }) {
  const [pages, setPages] = useState<Pages | null>(null);
  useEffect(() => {
    void chargerPages().then(setPages);
  }, []);
  const horsJeu = pages?.horsJeu ?? [];

  return (
    <main className="page">
      <EntetePage titre="Banque de questions" onRetour={onRetour}>
        <p>
          {paquet.questions.length} questions actives, posées dans le quiz. Les questions suspendues ou archivées sont listées
          avec leur statut mais ne sont jamais posées.
        </p>
      </EntetePage>

      <div className="flex flex-col gap-3">
        {Object.keys(THEMES).map((t) => {
          const actives = paquet.questions.filter((q) => q.theme === t);
          const autres = horsJeu.filter((q) => q.theme === t);
          return (
            <details key={t} className="depliant carte px-5 py-2">
              <summary className="titre-carte">
                <span>
                  {libelleTheme(t)}{' '}
                  <span className="text-sm font-normal text-discret">
                    · {actives.length} actives{autres.length ? `, ${autres.length} hors jeu` : ''}
                  </span>
                </span>
              </summary>
              <ul className="depliant-contenu">
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
      </div>
    </main>
  );
}
