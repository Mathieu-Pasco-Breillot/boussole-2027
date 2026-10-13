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
import { Texte } from '../glossaire/Texte.tsx';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { EnteteParcours } from '../ui/EnteteParcours.tsx';
import { NoteConfiance } from '../ui/NoteConfiance.tsx';
import { PastilleCandidat } from '../ui/PastilleCandidat.tsx';
import { ProgressionParcours } from '../ui/ProgressionParcours.tsx';

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
    <main className="parcours">
      <EnteteParcours>
        <button type="button" onClick={onQuitter} className="lien">
          Quitter
        </button>
      </EnteteParcours>
      <ProgressionParcours etiquette="Proposition" position={partie.position} total={total} avancement={repondues} />
      <div className="mt-5 flex items-center gap-3">
        <PastilleCandidat prenom={c.prenom} nom={c.nom} />
        <p className="flex flex-col leading-tight">
          <span className="surtitre">Duel avec</span>
          <span>
            <strong className="text-marine">{nom}</strong> · <span className="text-discret">{c.parti}</span>
          </span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${question.id}-${revelation ? 'r' : 'q'}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: reduit ? 0 : 0.2 }}
          className="mt-6 flex-1"
        >
          <p className="surtitre surtitre-point" data-testid="theme">
            {libelleTheme(s.theme)}
          </p>
          <p className="question-aide">Êtes-vous d'accord ?</p>
          <h1 className="question-titre">
            <Texte>{question.enonce}</Texte>
          </h1>
          <Depliants question={question} />

          {!revelation ? (
            <>
              <div role="group" aria-label="Votre réponse" className="reponses mt-6">
                {echelle.map((e) => (
                  <button key={e.valeur} type="button" onClick={() => repondre(e.valeur, important)} className="reponse">
                    {e.libelle}
                  </button>
                ))}
              </div>
              <button type="button" aria-pressed={important} onClick={() => setImportant((v) => !v)} className="bascule mt-3">
                {important ? '★' : '☆'} Très important pour moi
              </button>
              <button type="button" onClick={() => repondre('sans_avis', false)} className="lien mt-2 ml-auto flex">
                Sans avis
              </button>
            </>
          ) : (
            <section className="mt-6 flex flex-col gap-4" aria-label={`Position de ${nom}`} data-revelation>
              <Carte note className="p-5 leading-relaxed">
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
              </Carte>

              {affinite && (
                <Carte douce className="p-5" role="status" data-affinite>
                  {affinite.affichable && affinite.score.scoreArrondi !== null ? (
                    <>
                      <p className="text-sm text-discret">Affinité en direct avec {nom}</p>
                      <p className="font-titre text-5xl font-semibold tracking-tight text-accent" aria-label={`Affinité ${affinite.score.scoreArrondi} sur 100`}>
                        {affinite.score.scoreArrondi} <span className="text-lg text-discret">/ 100</span>
                      </p>
                      <progress className="barre mt-2" aria-label="Affinité sur 100" max={100} value={affinite.score.scoreArrondi} />
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
                </Carte>
              )}

              <Bouton grand onClick={onSuivante}>
                {derniere ? 'Voir mon résultat' : 'Proposition suivante →'}
              </Bouton>
              <button type="button" onClick={onModifier} className="lien text-left">
                Modifier ma réponse (vous avez déjà vu sa position)
              </button>
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      <NoteConfiance className="mt-8 justify-center">Vos réponses restent sur votre appareil.</NoteConfiance>
    </main>
  );
}
