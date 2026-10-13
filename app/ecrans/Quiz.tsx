import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { Valeur } from '../../core/score/types.ts';
import type { Partie } from '../jeu.ts';
import { questionCourante, situation } from '../jeu.ts';
import { Depliants } from './Depliants.tsx';
import { ECHELLE, libelleTheme } from '../libelles.ts';
import { Texte } from '../glossaire/Texte.tsx';
import { EnteteParcours } from '../ui/EnteteParcours.tsx';
import { NoteConfiance } from '../ui/NoteConfiance.tsx';
import { ProgressionParcours } from '../ui/ProgressionParcours.tsx';

interface Props {
  partie: Partie;
  onRepondre: (valeur: Valeur | 'sans_avis', tresImportant: boolean) => void;
  onReculer: () => void;
  onQuitter: () => void;
}

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
    <main className="parcours">
      <EnteteParcours>
        <button type="button" onClick={onQuitter} className="lien">
          Quitter
        </button>
      </EnteteParcours>
      <ProgressionParcours etiquette="Proposition" position={partie.position} total={total} avancement={partie.position} />

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: reduit ? 0 : 0.2 }}
          className="mt-8 flex-1"
        >
          {/* Le thème, à titre indicatif : le quiz s'enchaîne sans écran intermédiaire entre deux thèmes. */}
          <p className="surtitre surtitre-point" data-testid="theme">
            {libelleTheme(s.theme)}
          </p>
          <p className="question-aide">Êtes-vous d'accord ?</p>
          <h1 className="question-titre">
            <Texte>{question.enonce}</Texte>
          </h1>
          <Depliants question={question} />

          <div role="group" aria-label="Votre réponse" className="reponses mt-6">
            {echelle.map((e) => (
              <button key={e.valeur} type="button" aria-pressed={deja?.valeur === e.valeur} onClick={() => repondre(e.valeur, important)} className="reponse">
                {e.libelle}
              </button>
            ))}
          </div>

          <button type="button" aria-pressed={important} onClick={() => setImportant((v) => !v)} className="bascule mt-3">
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
        </motion.div>
      </AnimatePresence>

      <NoteConfiance className="mt-8 justify-center">Vos réponses restent sur votre appareil.</NoteConfiance>
    </main>
  );
}
