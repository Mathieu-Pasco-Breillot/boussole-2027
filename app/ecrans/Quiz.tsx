import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { Valeur } from '../../core/score/types.ts';
import type { Partie } from '../jeu.ts';
import { questionCourante, situation } from '../jeu.ts';
import { Depliants } from './Depliants.tsx';
import { ECHELLE, libelleTheme } from '../libelles.ts';
import { Texte } from '../glossaire/Texte.tsx';

interface Props {
  partie: Partie;
  onRepondre: (valeur: Valeur | 'sans_avis', tresImportant: boolean) => void;
  onReculer: () => void;
  onQuitter: () => void;
}

/** Une seule teinte (l'or), d'intensité croissante de part et d'autre du centre : ni bien ni mal. */
export const INTENSITE: Record<number, string> = {
  2: 'bg-accent/45 border-accent',
  1: 'bg-accent/25 border-accent/70',
  0: 'bg-accent/8 border-accent/40',
  [-1]: 'bg-accent/25 border-accent/70',
  [-2]: 'bg-accent/45 border-accent',
};

export function Quiz({ partie, onRepondre, onReculer, onQuitter }: Props) {
  const question = questionCourante(partie);
  const s = situation(partie);
  const deja = partie.reponses[question.id];
  const [important, setImportant] = useState(deja?.tresImportant ?? false);
  useEffect(() => {
    setImportant(deja?.tresImportant ?? false);
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // L'ancienne carte reste un instant à l'écran pendant sa sortie : ses boutons ne doivent plus rien enregistrer.
  const courante = useRef(question.id);
  courante.current = question.id;
  const repondre = (valeur: Valeur | 'sans_avis', tresImportant: boolean) => {
    if (courante.current === question.id) onRepondre(valeur, tresImportant);
  };
  const reculer = () => {
    if (courante.current === question.id) onReculer();
  };
  const total = partie.questions.length;
  // Animations réduites : la carte suivante s'affiche d'un coup, sans fondu (texte lisible tout de suite).
  const reduit = useReducedMotion();
  const echelle = partie.echelleInversee ? [...ECHELLE].reverse() : ECHELLE;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 pt-4 pb-6 md:px-8 md:pt-6">
      <EnteteQuiz position={partie.position} total={total} avancement={partie.position} onQuitter={onQuitter} />

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: reduit ? 0 : 0.2 }}
          className="mt-6 grid flex-1 content-start gap-6 lg:mt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
        >
          <div>
            {/* Le thème, à titre indicatif : le quiz s'enchaîne sans écran intermédiaire entre deux thèmes. */}
            <p className="pilule surtitre" data-testid="theme">
              {libelleTheme(s.theme)}
            </p>
            <p className="mt-4 text-sm font-medium text-discret">Êtes-vous d'accord ?</p>
            <h1 className="mt-1 font-titre text-[clamp(1.6rem,1.25rem+1.6vw,2.4rem)] leading-[1.18] font-bold tracking-[-0.015em]">
              <Texte>{question.enonce}</Texte>
            </h1>
            <Depliants question={question} />
          </div>

          <div className="flex flex-col lg:self-start lg:rounded-3xl lg:border lg:border-trait lg:bg-carte lg:p-6 lg:shadow-xl lg:shadow-black/5">
            <div className="flex flex-col gap-2">
              {echelle.map((e) => (
                <button
                  key={e.valeur}
                  type="button"
                  aria-pressed={deja?.valeur === e.valeur}
                  onClick={() => repondre(e.valeur, important)}
                  className={`reponse ${INTENSITE[e.valeur]} ${deja?.valeur === e.valeur ? 'ring-3 ring-encre' : ''}`}
                >
                  {e.libelle}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-pressed={important}
              onClick={() => setImportant((v) => !v)}
              className={`mt-4 min-h-12 rounded-xl border px-4 py-3 text-left font-medium ${
                important ? 'border-accent bg-accent/15' : 'border-trait bg-carte text-discret lg:bg-fond'
              }`}
            >
              {important ? '★' : '☆'} Très important pour moi
            </button>

            <div className="mt-2 flex items-center justify-between gap-3">
              <button type="button" onClick={reculer} disabled={partie.position === 0} className="lien disabled:opacity-30">
                ← Proposition précédente
              </button>
              <button type="button" onClick={() => repondre('sans_avis', false)} className="lien">
                Sans avis
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

/** Haut des écrans de quiz (classique et duel) : quitter, barre de progression, compteur. */
export function EnteteQuiz({ position, total, avancement, onQuitter }: { position: number; total: number; avancement: number; onQuitter: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={onQuitter} className="lien shrink-0">
        Quitter
      </button>
      <div className="jauge flex-1" role="progressbar" aria-label="Progression" aria-valuemin={0} aria-valuemax={total} aria-valuenow={avancement}>
        <div className="transition-[width] duration-300" style={{ width: `${(avancement / total) * 100}%` }} />
      </div>
      <span aria-live="polite" className="shrink-0 font-titre text-sm font-bold tabular-nums">
        {position + 1} / {total}
      </span>
    </div>
  );
}
