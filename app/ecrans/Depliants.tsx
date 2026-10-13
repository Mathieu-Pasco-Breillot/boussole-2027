import { useEffect, useState } from 'react';
import type { QuestionPaquet } from '../paquet.ts';
import { Texte } from '../glossaire/Texte.tsx';

/**
 * Les deux encarts dépliables sous l'énoncé : « Précision » (état actuel) et « Impact » (ce que la mesure
 * changerait, arguments des partisans et des opposants, sources). Un seul ouvert à la fois ; tout se referme
 * à chaque nouvelle proposition.
 */
export function Depliants({ question }: { question: QuestionPaquet }) {
  const [ouvert, setOuvert] = useState<'precision' | 'impact' | null>(null);
  useEffect(() => setOuvert(null), [question.id]);
  const basculer = (e: 'precision' | 'impact') => setOuvert((o) => (o === e ? null : e));
  if (!question.precision && !question.impact) return null;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {question.precision && (
          <button type="button" aria-expanded={ouvert === 'precision'} onClick={() => basculer('precision')} className={`pilule min-h-11 cursor-pointer ${ouvert === 'precision' ? 'border-accent bg-accent/15' : 'text-discret'}`}>
            Précision {ouvert === 'precision' ? '▴' : '▾'}
          </button>
        )}
        {question.impact && (
          <button type="button" aria-expanded={ouvert === 'impact'} onClick={() => basculer('impact')} className={`pilule min-h-11 cursor-pointer ${ouvert === 'impact' ? 'border-accent bg-accent/15' : 'text-discret'}`}>
            Impact {ouvert === 'impact' ? '▴' : '▾'}
          </button>
        )}
      </div>

      {ouvert === 'precision' && question.precision && (
        <p className="carte mt-2 p-4 text-[0.95rem] leading-relaxed">
          <Texte>{question.precision}</Texte>
        </p>
      )}

      {ouvert === 'impact' && question.impact && (
        <div className="carte mt-2 space-y-3 p-4 text-[0.95rem] leading-relaxed">
          <section>
            <h2 className="font-titre font-bold">Ce que ça changerait</h2>
            <p>
              <Texte>{question.impact.changement}</Texte>
            </p>
          </section>
          <section>
            <h2 className="font-titre font-bold">Ce qui fait débat</h2>
            <p className="mt-1">
              <strong>Pour : </strong>
              <Texte>{question.impact.pour}</Texte>
            </p>
            <p className="mt-1">
              <strong>Contre : </strong>
              <Texte>{question.impact.contre}</Texte>
            </p>
          </section>
          <details>
            <summary className="min-h-11 cursor-pointer text-discret underline">Sources ({question.impact.sources.length})</summary>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {question.impact.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {s.titre}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
