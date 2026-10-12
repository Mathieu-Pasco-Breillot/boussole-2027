import { useEffect, useState } from 'react';
import type { QuestionPaquet } from '../paquet.ts';

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
    <div className="mt-3">
      <div className="flex gap-5">
        {question.precision && (
          <button type="button" aria-expanded={ouvert === 'precision'} onClick={() => basculer('precision')} className="min-h-11 text-sm text-sourdine underline">
            Précision {ouvert === 'precision' ? '▴' : '▾'}
          </button>
        )}
        {question.impact && (
          <button type="button" aria-expanded={ouvert === 'impact'} onClick={() => basculer('impact')} className="min-h-11 text-sm text-sourdine underline">
            Impact {ouvert === 'impact' ? '▴' : '▾'}
          </button>
        )}
      </div>

      {ouvert === 'precision' && question.precision && (
        <p className="mt-1 rounded-xl bg-nuit-clair p-3 text-sm leading-relaxed">{question.precision}</p>
      )}

      {ouvert === 'impact' && question.impact && (
        <div className="mt-1 space-y-3 rounded-xl bg-nuit-clair p-3 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold">Ce que ça changerait</h2>
            <p>{question.impact.changement}</p>
          </section>
          <section>
            <h2 className="font-semibold">Ce qui fait débat</h2>
            <p className="mt-1">
              <span className="text-sourdine">Pour : </span>
              {question.impact.pour}
            </p>
            <p className="mt-1">
              <span className="text-sourdine">Contre : </span>
              {question.impact.contre}
            </p>
          </section>
          <details>
            <summary className="min-h-11 cursor-pointer text-sourdine underline">Sources ({question.impact.sources.length})</summary>
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
