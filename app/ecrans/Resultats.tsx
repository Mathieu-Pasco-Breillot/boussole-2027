import { apresDesaccordsLus, badgesDe } from '../badges.ts';
import { EVENEMENT_BADGES, lireBadges, majBadges } from '../stockage.ts';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AccordDesaccord, HorsClassement, Classe, ScoreCandidat } from '../../core/score/index.ts';
import type { Valeur } from '../../core/score/types.ts';
import type { Partie } from '../jeu.ts';
import { questionsParId, resultatsDePartie } from '../jeu.ts';
import { FIABILITE, libelleTheme, libelleValeur, MODES, MOTIFS_NON_EVALUATION, NATURES } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { CartePartage } from './CartePartage.tsx';
import { Extraits } from './Extraits.tsx';
import { SEUIL_CLASSEMENT_QUESTIONS } from '../../core/score/parametres.ts';
import { jouer } from '../son.ts';
import { Texte } from '../glossaire/Texte.tsx';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { EnteteParcours } from '../ui/EnteteParcours.tsx';

interface Props {
  partie: Partie;
  /** La révélation a déjà été vue pour cette partie (retour depuis une fiche) : pas de nouvelle animation. */
  dejaRevele: boolean;
  onRevele: () => void;
  onFiche: (id: string) => void;
  onNouvelle: () => void;
  onDefi: () => void;
  onVieprivee: () => void;
  onToutEffacer: () => void;
}

const candidatParId = new Map(paquet.candidats.map((c) => [c.id, c]));
const nomComplet = (id: string): string => {
  const c = candidatParId.get(id);
  return c ? `${c.prenom} ${c.nom}` : id;
};
const partiDe = (id: string): string => candidatParId.get(id)?.parti ?? '';

function groupesParMotif(liste: readonly { candidatId: string; motif: string }[]): [string, { candidatId: string; motif: string }[]][] {
  const groupes = new Map<string, { candidatId: string; motif: string }[]>();
  for (const n of liste) groupes.set(n.motif, [...(groupes.get(n.motif) ?? []), n]);
  return [...groupes.entries()];
}

function LigneAccord({ candidatId, a }: { candidatId: string; a: AccordDesaccord }) {
  const q = questionsParId.get(a.questionId);
  const position = paquet.positions[candidatId]?.find((p) => p.questionId === a.questionId);
  return (
    <li className="ligne-position">
      <p className="font-semibold">
        <Texte>{q?.enonce}</Texte>
      </p>
      <p className="mt-1 text-discret">{libelleTheme(a.theme)}</p>
      <p className="mt-2">
        Votre réponse : <strong>{libelleValeur(a.reponse as Valeur)}</strong>
      </p>
      <p>
        Sa position : <strong>{libelleValeur(a.code)}</strong> ({NATURES[a.nature] ?? a.nature})
      </p>
      <Extraits extraits={position?.extraits} />
    </li>
  );
}

export function Detail({ s }: { s: ScoreCandidat }) {
  return (
    <div className="mt-3 flex flex-col gap-4">
      {s.score.scoreBrut !== null && (
        <p className="text-sm text-discret">
          Score brut : {Math.round(s.score.scoreBrut)} sur 100 · coefficient de couverture c = {s.score.c.toFixed(2)} (plus
          il est bas, plus le score est ramené vers 50).
        </p>
      )}
      {s.arbitragesEnAttente > 0 && (
        <p className="text-sm text-discret">
          {s.arbitragesEnAttente} position(s) en attente d'arbitrage : traitée(s) comme « non connu ».
        </p>
      )}
      <section>
        <h4 className="titre-carte">Accords les plus forts</h4>
        {s.accords.length === 0 ? (
          <p className="text-sm text-discret">Aucun accord fort sur les questions codées.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {s.accords.map((a) => (
              <LigneAccord key={a.questionId} candidatId={s.candidatId} a={a} />
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4 className="titre-carte">Désaccords les plus forts</h4>
        {s.desaccords.length === 0 ? (
          <p className="text-sm text-discret">Aucun désaccord fort sur les questions codées.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {s.desaccords.map((a) => (
              <LigneAccord key={a.questionId} candidatId={s.candidatId} a={a} />
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4 className="titre-carte">Par thème</h4>
        <ul className="mt-2 text-sm">
          {s.themes.map((t) => (
            <li key={t.theme} className="flex justify-between border-b border-trait py-1">
              <span>{libelleTheme(t.theme)}</span>
              <span className="text-discret">
                {t.affichage === 'affiche' && t.score.scoreArrondi !== null ? `${t.score.scoreArrondi} / 100` : 'trop peu de questions'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CarteCandidat({ s, rang, exAequo, visible = true, onFiche }: { s: ScoreCandidat; rang?: number; exAequo?: boolean; visible?: boolean; onFiche: (id: string) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const classe = rang !== undefined;
  const motif = (s as HorsClassement).motif;
  return (
    <motion.li
      className="carte p-4 md:p-5"
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.35 }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">
        {classe && (
          <span className="rang">
            <span className="sr-only">Rang </span>
            {rang}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="titre-carte">
            <button type="button" onClick={() => onFiche(s.candidatId)} tabIndex={visible ? undefined : -1} className="lien-titre">
              {nomComplet(s.candidatId)}
              <span className="sr-only"> : ouvrir la fiche</span>
            </button>
          </h3>
          <p className="text-sm text-discret">
            {exAequo ? 'ex æquo · ' : ''}
            {partiDe(s.candidatId)}
          </p>
        </div>
        {classe && s.score.scoreArrondi !== null && (
          <p className="score" aria-label={`Score ${s.score.scoreArrondi} sur 100`}>
            {s.score.scoreArrondi}
          </p>
        )}
      </div>
      {classe ? (
        <>
          <progress className="barre barre-epaisse mt-3" data-barre-score aria-hidden="true" max={100} value={s.score.scoreArrondi ?? 0} />
          <p className="mt-2 text-sm text-discret">
            Fiabilité {FIABILITE[s.fiabilite]} · codé sur {s.score.codees} de vos {s.score.repondues} questions
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm">
          Hors classement : {motif?.texte ?? 'trop peu de questions codées'}.
        </p>
      )}
      <button
        type="button"
        aria-expanded={ouvert}
        onClick={() => {
          if (!ouvert) {
            // Badge « Contradicteur » : le détail montre les extraits de ses trois désaccords les plus forts.
            const avecExtrait = s.desaccords.filter((a) => paquet.positions[s.candidatId]?.find((p) => p.questionId === a.questionId)?.extraits?.length);
            if (avecExtrait.length >= 3) majBadges(apresDesaccordsLus);
          }
          setOuvert((o) => !o);
        }}
        className="lien mt-1"
      >
        {ouvert ? 'Masquer le détail' : 'Voir le détail et les sources'} {ouvert ? '▴' : '▾'}
      </button>
      {ouvert && <Detail s={s} />}
    </motion.li>
  );
}

function SectionBadges() {
  const [etat, setEtat] = useState(lireBadges);
  useEffect(() => {
    const maj = () => setEtat(lireBadges());
    window.addEventListener(EVENEMENT_BADGES, maj);
    return () => window.removeEventListener(EVENEMENT_BADGES, maj);
  }, []);
  const badges = badgesDe(etat);
  return (
    <Carte as="section" className="p-5" aria-labelledby="titre-badges">
      <h2 id="titre-badges" className="titre-carte">
        Vos badges
      </h2>
      <p className="mt-1 text-sm text-discret">Ils récompensent l'usage de l'outil, jamais le sens de vos réponses. Ils restent sur votre téléphone.</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {badges.map((b) => (
          <li key={b.id} className="badge-ligne" data-obtenu={b.obtenu}>
            <p className="font-semibold">
              <span aria-hidden="true" className="badge-etoile">
                {b.obtenu ? '★ ' : '☆ '}
              </span>
              {b.nom}
              <span className="sr-only">{b.obtenu ? ' (obtenu)' : ' (pas encore obtenu)'}</span>
            </p>
            <p className="text-discret">
              {b.description}
              {!b.obtenu && b.avancement ? ` Avancement : ${b.avancement}.` : ''}
            </p>
          </li>
        ))}
      </ul>
    </Carte>
  );
}

export function Resultats({ partie, dejaRevele, onRevele, onFiche, onNouvelle, onDefi, onVieprivee, onToutEffacer }: Props) {
  const r = useMemo(() => resultatsDePartie(partie), [partie]);
  const total = partie.questions.length;
  const classement: Classe[] = r.classement;
  const horsClassement: HorsClassement[] = r.horsClassement;

  // Révélation (J4) : un court suspense, puis les cartes du classement une à une, de la dernière à la première.
  // Même animation pour tous. Le reste de la page (hors classement, non évalués) s'affiche ensuite, sans animation.
  // Animations réduites ou aucun classé : tout est visible tout de suite.
  const reduit = useReducedMotion();
  const n = classement.length;
  const [revelees, setRevelees] = useState(() => (reduit || dejaRevele || n === 0 ? n : -1));
  useEffect(() => {
    if (revelees >= n) return;
    const delai = revelees < 0 ? 1200 : 450;
    const t = setTimeout(() => setRevelees(revelees + 1 < 0 ? 0 : revelees + 1), delai);
    return () => clearTimeout(t);
  }, [revelees, n]);
  const fini = revelees >= n;
  // Son de révélation (J9, coupé par défaut) : le même pour tous, quand le classement commence à s'afficher.
  const sonJoue = useRef(dejaRevele);
  useEffect(() => {
    if (fini) onRevele();
  }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (sonJoue.current || revelees < 0) return;
    sonJoue.current = true;
    jouer('revelation');
  }, [revelees]);

  return (
    <main className="conteneur flex flex-col gap-8 pt-4 pb-10">
      <EnteteParcours>
        <Bouton variante="lien" onClick={onNouvelle}>
          Retour à l'accueil
        </Bouton>
      </EnteteParcours>

      <header>
        <p className="surtitre surtitre-point">Vos résultats</p>
        <h1 className="titre-page mt-3">Boussole</h1>
        <p className="mt-3 text-discret">
          Mode {MODES[partie.mode].nom} · {r.repondues} réponses sur {total} questions · graine du tirage {partie.graine}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          {classement.length === 0 && (
            <Carte as="section" note className="p-5 leading-relaxed">
              <h2 className="titre-carte">Aucun candidat n'est classé pour l'instant</h2>
              <p className="mt-2">
                Pour classer un candidat, il faut qu'il soit codé sur au moins {SEUIL_CLASSEMENT_QUESTIONS} de vos questions. Le codage des positions n'est pas terminé : aujourd'hui, les candidats ne sont codés que sur un petit
                nombre de questions. Ce n'est ni une victoire, ni un échec pour personne.
              </p>
              <p className="mt-2">
                Vous pouvez tout de même consulter, candidat par candidat, vos accords et désaccords sur les questions déjà
                codées, avec les sources.
              </p>
            </Carte>
          )}

          {classement.length > 0 && (
            <section>
              <h2 className="titre-section">Classement</h2>
              {!fini && (
                <div className="mt-2 flex items-center justify-between gap-3 text-sm text-discret">
                  <p role="status">{revelees < 0 ? 'Calcul de votre rapprochement…' : 'Voici le classement…'}</p>
                  <Bouton variante="lien" onClick={() => setRevelees(n)}>
                    Passer l'animation
                  </Bouton>
                </div>
              )}
              <ol className="mt-3 flex flex-col gap-3">
                {classement.map((c, i) => (
                  <CarteCandidat key={c.candidatId} s={c} rang={c.rang} exAequo={c.exAequo} visible={i >= n - Math.max(revelees, 0)} onFiche={onFiche} />
                ))}
              </ol>
            </section>
          )}

          {fini && horsClassement.length > 0 && (
            <section>
              <h2 className="titre-section">Hors classement</h2>
              <p className="mt-1 text-sm text-discret">Ordre tiré au sort à chaque partie.</p>
              <ul className="mt-3 flex flex-col gap-3">
                {horsClassement.map((c) => (
                  <CarteCandidat key={c.candidatId} s={c} onFiche={onFiche} />
                ))}
              </ul>
            </section>
          )}

          {fini && r.nonEvalues.length > 0 && (
            <section>
              <h2 className="titre-section">Non évalués</h2>
              <p className="mt-1 text-sm text-discret">
                Ces personnes ne remplissent pas encore le critère d'inclusion. Le critère est public dans le dépôt du projet.
              </p>
              {groupesParMotif(r.nonEvalues).map(([motif, liste]) => (
                <div key={motif} className="mt-3">
                  <h3 className="font-semibold text-marine">{MOTIFS_NON_EVALUATION[motif] ?? motif}</h3>
                  <p className="text-sm text-discret">{liste.map((n) => nomComplet(n.candidatId)).join(', ')}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        <aside aria-label="Autour de vos résultats" className="flex min-w-0 flex-col gap-6">
          {fini && r.affinites.length > 0 && (
            <Carte as="section" className="p-5 leading-relaxed">
              <h2 className="titre-carte">Vos affinités</h2>
              <p className="mt-1 text-sm text-discret">Les affinités n'entrent pas dans le score : elles servent seulement à situer ces candidats.</p>
              <ul className="mt-3 flex flex-col gap-1">
                {r.affinites.map((a) => (
                  <li key={a.candidatId}>
                    <strong>{nomComplet(a.candidatId)}</strong> :{' '}
                    {a.situation === 'classe'
                      ? `${a.exAequo ? 'ex aequo, ' : ''}${a.rang}${a.rang === 1 ? 'er' : 'e'} du classement, score ${a.score}`
                      : a.situation === 'hors_classement'
                        ? `hors classement (${a.motif.texte})`
                        : a.situation === 'non_evalue'
                          ? `non évalué (${MOTIFS_NON_EVALUATION[a.motif] ?? a.motif})`
                          : 'candidat inconnu'}
                  </li>
                ))}
              </ul>
            </Carte>
          )}

          {fini && <CartePartage mode={partie.mode} graine={partie.graine} classement={classement} nom={nomComplet} />}

          {fini && <SectionBadges />}

          <Carte as="section" douce className="p-5 text-sm leading-relaxed text-discret">
            <p>Les écarts entre candidats comptent plus que les valeurs : répondre « ni d'accord, ni pas d'accord » partout donne au moins 50 avec tout le monde.</p>
            <p className="mt-2">Les votes au Parlement n'entrent ni dans le codage des positions ni dans le score. Indicateur de votes : pas encore disponible.</p>
            <p className="mt-2">
              Même graine et mêmes réponses redonnent les mêmes résultats. Méthode complète et données :{' '}
              <a className="lien-texte" href="https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027" rel="noopener noreferrer">
                dépôt du projet
              </a>
              .
            </p>
          </Carte>

          <div className="flex flex-col gap-3">
            <Bouton grand pleine fleche onClick={onNouvelle}>
              Nouvelle partie, nouvelles questions
            </Bouton>
            <Bouton variante="secondaire" pleine onClick={onDefi}>
              Jouer au défi « Qui a dit ça ? »
            </Bouton>
            <div className="flex flex-wrap justify-center gap-x-6">
              <Bouton variante="lien" onClick={onVieprivee}>
                Vie privée
              </Bouton>
              <Bouton variante="lien" onClick={onToutEffacer}>
                Tout effacer sur cet appareil
              </Bouton>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
