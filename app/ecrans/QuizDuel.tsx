import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Extraits } from './Extraits.tsx';
import { useEffect, useRef, useState } from 'react';
import { qualifierEcart } from '../../core/duel/index.ts';
import type { Valeur } from '../../core/score/types.ts';
import type { PartieDuel } from '../duel.ts';
import { affiniteDePartie, enRevelation, positionSur } from '../duel.ts';
import { questionCourante, situation } from '../jeu.ts';
import { Depliants } from './Depliants.tsx';
import { ECARTS, ECHELLE, libelleTheme, libelleValeur, NATURES } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { EnteteQuiz, INTENSITE } from './Quiz.tsx';
import { Texte } from '../glossaire/Texte.tsx';

interface Props {
  partie: PartieDuel;
  onRepondre: (valeur: Valeur | 'sans_avis', tresImportant: boolean) => void;
  onSuivante: () => void;
  onModifier: () => void;
  onQuitter: () => void;
}

const candidat = (id: string) => paquet.candidats.find((c) => c.id === id)!;

/**
 * Quiz du duel. Deux temps par proposition : la réponse, puis la révélation de la position du candidat
 * (reformulation, citation courte, source) avec l'affinité en direct. Le candidat est nommé ; aucun autre ne l'est.
 */
export function QuizDuel({ partie, onRepondre, onSuivante, onModifier, onQuitter }: Props) {
  const question = questionCourante(partie);
  const s = situation(partie);
  const c = candidat(partie.candidat);
  const nom = `${c.prenom} ${c.nom}`;
  const saisie = partie.reponses[question.id];
  const revelation = enRevelation(partie);
  const [important, setImportant] = useState(saisie?.tresImportant ?? false);
  useEffect(() => {
    setImportant(saisie?.tresImportant ?? false);
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // L'ancienne carte reste un instant à l'écran pendant sa sortie : ses boutons ne doivent plus rien enregistrer.
  const courante = useRef(question.id);
  courante.current = question.id;
  const repondre = (valeur: Valeur | 'sans_avis', tresImportant: boolean) => {
    if (courante.current === question.id) onRepondre(valeur, tresImportant);
  };
  const total = partie.questions.length;
  // Animations réduites : la carte suivante s'affiche d'un coup, sans fondu (texte lisible tout de suite).
  const reduit = useReducedMotion();
  const echelle = partie.echelleInversee ? [...ECHELLE].reverse() : ECHELLE;
  const repondues = Object.keys(partie.reponses).length;

  const position = revelation ? positionSur(partie, question.id) : undefined;
  const affinite = revelation ? affiniteDePartie(partie) : null;
  const derniere = partie.position === total - 1;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 pt-4 pb-6 md:px-8 md:pt-6">
      <EnteteQuiz position={partie.position} total={total} avancement={repondues} onQuitter={onQuitter} />
      <p className="pilule mt-4 w-fit text-discret">
        <span>
          Duel avec <strong className="text-encre">{nom}</strong> · {c.parti}
        </span>
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${question.id}-${revelation ? 'r' : 'q'}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: reduit ? 0 : 0.2 }}
          className="mt-5 grid flex-1 content-start gap-6 lg:mt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
        >
          <div>
          <p className="pilule surtitre" data-testid="theme">
            {libelleTheme(s.theme)}
          </p>
          <p className="mt-4 text-sm font-medium text-discret">Êtes-vous d'accord ?</p>
          <h1 className="mt-1 font-titre text-[clamp(1.6rem,1.25rem+1.6vw,2.4rem)] leading-[1.18] font-bold tracking-[-0.015em]">
            <Texte>{question.enonce}</Texte>
          </h1>
          <Depliants question={question} />
          </div>

          {!revelation ? (
            <div className="flex flex-col lg:self-start lg:rounded-3xl lg:border lg:border-trait lg:bg-carte lg:p-6 lg:shadow-xl lg:shadow-black/5">
              <div className="flex flex-col gap-2">
                {echelle.map((e) => (
                  <button
                    key={e.valeur}
                    type="button"
                    onClick={() => repondre(e.valeur, important)}
                    className={`reponse ${INTENSITE[e.valeur]}`}
                  >
                    {e.libelle}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-pressed={important}
                onClick={() => setImportant((v) => !v)}
                className={`mt-4 min-h-12 rounded-xl border px-4 py-3 text-left font-medium ${important ? 'border-accent bg-accent/15' : 'border-trait bg-carte text-discret lg:bg-fond'}`}
              >
                {important ? '★' : '☆'} Très important pour moi
              </button>
              <button type="button" onClick={() => repondre('sans_avis', false)} className="lien mt-2 self-end">
                Sans avis
              </button>
            </div>
          ) : (
            <section className="flex flex-col gap-4" aria-label={`Position de ${nom}`} data-revelation>
              <div className="carte border-l-4 border-l-accent p-5 leading-relaxed">
                <p className="surtitre">Ce que porte {nom}</p>
                <p className="mt-2">
                  Votre réponse : <strong>{saisie!.valeur === 'sans_avis' ? 'sans avis' : libelleValeur(saisie!.valeur)}</strong>
                  {saisie!.tresImportant ? ' (très important)' : ''}
                </p>
                {position && position.code !== null && (
                  <p>
                    Sa position : <strong>{libelleValeur(position.code)}</strong>{' '}
                    <span className="text-discret">({position.nature ? (NATURES[position.nature] ?? position.nature) : ''})</span>
                  </p>
                )}
                {position && position.code !== null && saisie!.valeur !== 'sans_avis' && (
                  <p className="mt-1 text-sm text-discret">
                    {ECARTS[qualifierEcart(4 - Math.abs(saisie!.valeur - position.code))]}
                  </p>
                )}
                <Extraits extraits={position?.extraits} className="mt-3" />
              </div>

              {affinite && (
                <div className="carte p-5" role="status" data-affinite>
                  {affinite.affichable && affinite.score.scoreArrondi !== null ? (
                    <>
                      <p className="text-sm text-discret">Affinité en direct avec {nom}</p>
                      <p className="font-titre text-5xl font-extrabold tracking-tight" aria-label={`Affinité ${affinite.score.scoreArrondi} sur 100`}>
                        {affinite.score.scoreArrondi} <span className="text-lg text-discret">/ 100</span>
                      </p>
                      <div className="jauge mt-2">
                        <div style={{ width: `${affinite.score.scoreArrondi}%` }} />
                      </div>
                      <p className="mt-2 text-sm text-discret">
                        Fiabilité {affinite.fiabilite} · {affinite.score.codees} propositions comptées. Ce score n'est comparable ni à celui d'un autre candidat, ni au
                        classement des autres modes.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-discret">
                      Affinité en cours de calcul : encore {affinite.avantAffichage} réponse{affinite.avantAffichage > 1 ? 's' : ''} avant de
                      l'afficher (sous 8 propositions, un score ne voudrait rien dire).
                    </p>
                  )}
                </div>
              )}

              <button type="button" onClick={onSuivante} className="btn btn-primaire btn-grand">
                {derniere ? 'Voir mon résultat' : 'Proposition suivante →'}
              </button>
              <button type="button" onClick={onModifier} className="lien text-left">
                Modifier ma réponse (vous avez déjà vu sa position)
              </button>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
