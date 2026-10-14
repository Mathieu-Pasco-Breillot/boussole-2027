import { useState } from 'react';
import type { ReactNode } from 'react';
import { MODES, MOTIFS_NON_EVALUATION, THEMES } from '../libelles.ts';
import type { ModeJeu } from '../jeu.ts';
import { Reglages } from './Reglages.tsx';
import { NOM_MASCOTTE } from '../habillage.ts';
import { Mascotte } from './Mascotte.tsx';
import { groupesCandidats, nomComplet } from '../listes.ts';
import { paquet } from '../paquet.ts';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { ChoixMode } from '../ui/ChoixMode.tsx';
import { IconeBalance, IconeBouclier, IconeDuel, IconeFleche, IconeFlecheOblique, IconeQuestion, IconeQuiz } from '../ui/Icones.tsx';
import { NoteConfiance } from '../ui/NoteConfiance.tsx';
import { idOnglet, idPanneau } from '../ui/onglets.ts';
import { SelecteurFormat } from '../ui/SelecteurFormat.tsx';
import type { OptionFormat } from '../ui/SelecteurFormat.tsx';

const groupes = groupesCandidats();

/** Chiffres de l'accueil, lus dans le paquet de données : ils suivent le codage, sans mise à jour à la main. */
const SOURCES = new Set(
  Object.values(paquet.positions).flatMap((liste) => liste.flatMap((p) => (p.etat === 'publie' ? (p.extraits ?? []).map((e) => e.source.url) : []))),
).size;
const CHIFFRES: readonly { valeur: string; libelle: string }[] = [
  { valeur: String(paquet.questions.length), libelle: 'propositions concrètes' },
  { valeur: String(Object.keys(THEMES).length), libelle: 'thèmes de campagne' },
  { valeur: String(groupes.compares.length), libelle: 'candidats comparés' },
  { valeur: SOURCES.toLocaleString('fr-FR'), libelle: 'sources à ouvrir' },
];

/** Les six formats de partie, du plus court au plus long. */
const ORDRE_MODES: readonly ModeJeu[] = ['express', 'debat', 'campagne', 'semi', 'marathon', 'ultra'];
const FORMATS: readonly OptionFormat[] = ORDRE_MODES.map((m, i) => ({
  id: m,
  nom: MODES[m].nom,
  nombre: MODES[m].questions,
  unite: 'questions',
  detail: MODES[m].duree,
  niveau: i + 1,
  repere: m === 'express' ? 'Idéal pour commencer' : undefined,
}));
const TAILLES = ORDRE_MODES.map((m) => MODES[m].questions);

type ModeAccueil = 'quiz' | 'duel';
const BASE_JOUER = 'jouer';

interface Props {
  enCours: boolean;
  terminee: boolean;
  onCommencer: (mode: ModeJeu) => void;
  onDefi: () => void;
  onNaviguer: (ecran: 'methode' | 'banque' | 'candidats') => void;
  onReprendre: () => void;
  onVoirResultats: () => void;
  /** Mode Duel avec un candidat (phase-5/specification-mode-duel.md). */
  duelEnCours: boolean;
  duelTermine: boolean;
  onDuel: () => void;
  onReprendreDuel: () => void;
  onVoirResultatsDuel: () => void;
}

const allerA = (id: string) => document.getElementById(id)?.scrollIntoView({ block: 'start' });

/** Bandeau d'une partie enregistrée sur l'appareil : reprise ou dernier résultat. */
function Reprise({ titre, detail, onClick }: { titre: string; detail?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="carte flex w-full items-center justify-between gap-4 border-accent/60 p-4 text-left">
      <span>
        <span className="block font-titre text-lg text-marine">{titre}</span>
        {detail && <span className="text-sm text-discret">{detail}</span>}
      </span>
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-carte">
        <IconeFleche />
      </span>
    </button>
  );
}

/**
 * Illustration du haut de page : deux orbites, le sceau de l'élection (CSS pur, il tourne lentement sauf si le téléphone
 * demande des animations réduites) et la mascotte. Purement décorative (masquée aux lecteurs d'écran, rien de
 * cliquable) : le sceau n'a aucun emblème, la mascotte ne montre aucun thème ni aucune mesure.
 */
function Illustration() {
  return (
    <div aria-hidden="true" className="accueil-art select-none">
      <div className="accueil-orbite" />
      <div className="accueil-orbite accueil-orbite-interne" />
      <div data-sceau className="sceau">
        <span className="sceau-mention">Élections</span>
        <span className="sceau-annee">2027</span>
        <span className="sceau-mention">France · présidentielle</span>
      </div>
      <figure className="accueil-mascotte">
        <Mascotte attitude="accueil" taille={84} />
        <figcaption className="pilule -mt-1 px-2.5 py-0.5 text-xs">{NOM_MASCOTTE}</figcaption>
      </figure>
      <span className="accueil-art-note">Comprendre avant de choisir</span>
    </div>
  );
}

function Section({ id, surtitre, titre, intro, children, bande = false }: { id?: string; surtitre: string; titre: string; intro?: ReactNode; children: ReactNode; bande?: boolean }) {
  return (
    <section id={id} aria-labelledby={id ? `titre-${id}` : undefined} className={`scroll-mt-20 py-12 md:py-16 ${bande ? 'border-y border-trait bg-fond-bas' : ''}`}>
      <div className="conteneur">
        <p className="surtitre surtitre-point">{surtitre}</p>
        <h2 id={id ? `titre-${id}` : undefined} className="titre-section mt-2 max-w-2xl">
          {titre}
        </h2>
        {intro && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-discret">{intro}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/** Les trois temps d'une partie, textes de la maquette V0. */
const ETAPES: readonly { titre: string; texte: string }[] = [
  { titre: 'Vous répondez.', texte: 'À votre rythme, sans bonne ou mauvaise réponse.' },
  { titre: 'On compare.', texte: 'Vos réponses aux positions publiques des candidats, sources à l’appui.' },
  { titre: 'Vous explorez.', texte: 'Les sujets d’accord, de nuance et de désaccord.' },
];

/** Carte d'un mode de jeu (quiz ou duel) : toute la carte est un bouton. */
function CarteMode({ nom, titre, texte, icone, onClick }: { nom: string; titre: string; texte: string; icone: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="carte-mode">
      <span aria-hidden="true" className="carte-mode-icone">
        {icone}
      </span>
      <span className="carte-mode-texte">
        <span className="surtitre block">{nom}</span>
        <strong>{titre}</strong>
        <span>{texte}</span>
      </span>
      <IconeFlecheOblique className="ml-auto shrink-0 text-discret" />
    </button>
  );
}

const ENGAGEMENTS: readonly { titre: string; texte: string }[] = [
  {
    titre: 'Sourcé',
    texte: 'Chaque position codée s’appuie sur un programme ou une déclaration publique, avec un lien que vous pouvez ouvrir.',
  },
  {
    titre: 'Neutre par construction',
    texte: 'Mêmes règles pour tous, ordre alphabétique, aucune couleur de parti, aucun seuil de sondages. Le critère d’inclusion est public.',
  },
  {
    titre: 'Privé',
    texte: 'Tout le calcul se fait dans votre navigateur. Aucune réponse n’est envoyée, aucun suivi n’est installé.',
  },
  {
    titre: 'Ouvert',
    texte: 'Méthode, données et code sont publics : chacun peut vérifier un codage, refaire un calcul ou signaler une erreur.',
  },
];

const QUESTIONS_FREQUENTES: readonly { question: string; reponse: string }[] = [
  {
    question: 'L’outil me dit-il pour qui voter ?',
    reponse:
      'Non. Un score est un rapprochement entre vos réponses et des positions publiques, pas une consigne de vote. Il ne tient compte ni des personnalités, ni des sondages, ni des votes au Parlement.',
  },
  {
    question: 'D’où viennent les positions des candidats ?',
    reponse:
      'De leurs programmes et de leurs déclarations publiques. Chaque position est codée selon une grille publique, de « tout à fait d’accord » à « pas du tout d’accord », et accompagnée de ses sources.',
  },
  {
    question: 'Pourquoi certains candidats ne sont-ils pas classés ?',
    reponse:
      'Le codage avance thème par thème. Un candidat dont les positions sont encore trop peu codées sur vos questions apparaît « hors classement », avec le motif : mieux vaut ne rien afficher qu’un score fragile.',
  },
  {
    question: 'Mes réponses sont-elles enregistrées quelque part ?',
    reponse:
      'Seulement sur votre appareil, dans le stockage de votre navigateur, pour reprendre une partie ou revoir un résultat. Un bouton permet de tout effacer.',
  },
  {
    question: 'Puis-je refaire le test ?',
    reponse:
      'Oui, autant de fois que vous voulez : les questions sont tirées au sort à chaque partie, en évitant celles que vous avez déjà vues.',
  },
];

export function Accueil({ enCours, terminee, onCommencer, onDefi, onNaviguer, onReprendre, onVoirResultats, duelEnCours, duelTermine, onDuel, onReprendreDuel, onVoirResultatsDuel }: Props) {
  const reprises = enCours || terminee || duelEnCours || duelTermine;
  const [mode, setMode] = useState<ModeAccueil>('quiz');
  /** Vers le choix du format : onglet du quiz ouvert, section « Jouer » en haut de l'écran. */
  const allerAuQuiz = () => {
    setMode('quiz');
    allerA('jouer');
  };

  return (
    <main>
      {/* ── Haut de page ── */}
      <section aria-labelledby="titre-accueil">
        <div className="conteneur grid items-center gap-8 pt-10 pb-10 md:pt-14 md:pb-14 lg:grid-cols-[1fr_0.92fr]">
          <div className="entree flex flex-col items-start gap-5">
            <p className="surtitre flex items-center gap-2.5">
              <span aria-hidden="true" className="tricolore">
                <i />
                <i />
                <i />
              </span>
              Un outil citoyen, indépendant
            </p>
            <h1 id="titre-accueil" className="titre-accueil">
              Et si vous faisiez <br className="hidden sm:inline" />
              le point <em>avant</em> 2027&nbsp;?
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-discret">
              Un quiz politique pour explorer vos convictions et comprendre ce qui vous rapproche — ou vous éloigne — des
              propositions des candidats.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Bouton grand fleche onClick={allerAuQuiz}>
                Trouver mes affinités
              </Bouton>
              <Bouton grand variante="secondaire" onClick={onDuel}>
                <IconeDuel />
                Duel avec un candidat
              </Bouton>
            </div>
            <p className="flex items-center gap-2 text-sm text-discret">
              <IconeBouclier taille={16} className="shrink-0 text-accent" />
              Pas de bonne réponse. Pas de consigne de vote.
            </p>
          </div>
          <Illustration />
        </div>
      </section>

      {/* ── Comment ça marche : trois temps ── */}
      <section aria-labelledby="titre-etapes" className="conteneur">
        <div className="accueil-etapes">
          <h2 id="titre-etapes" className="surtitre">
            Comment ça marche ?
          </h2>
          <ol className="grid gap-4 md:grid-cols-3 md:gap-0">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="etape">
                <span aria-hidden="true" className="etape-numero">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong className="block text-marine">{e.titre}</strong>
                  <span className="mt-1 block text-sm leading-relaxed text-discret">{e.texte}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Parties enregistrées sur cet appareil ── */}
      {reprises && (
        <section aria-label="Vos parties sur cet appareil" className="conteneur mt-8 grid gap-3 md:grid-cols-2">
          {enCours && <Reprise titre="Reprendre la partie en cours" detail="Vous retrouvez vos réponses là où vous les avez laissées." onClick={onReprendre} />}
          {terminee && <Reprise titre="Revoir mon dernier résultat" onClick={onVoirResultats} />}
          {duelEnCours && <Reprise titre="Reprendre le duel en cours" detail="Vous retrouvez vos réponses là où vous les avez laissées." onClick={onReprendreDuel} />}
          {duelTermine && <Reprise titre="Revoir mon dernier duel" onClick={onVoirResultatsDuel} />}
        </section>
      )}

      {/* ── Votre parcours : les deux modes ── */}
      <section aria-labelledby="titre-parcours" className="conteneur grid items-center gap-3 py-12 md:grid-cols-[0.85fr_1fr_1fr] md:py-14">
        <div className="mb-2 md:mb-0">
          <p className="surtitre surtitre-point">Votre parcours</p>
          <h2 id="titre-parcours" className="titre-section mt-3">
            Deux façons de <br className="hidden md:inline" />
            vous situer.
          </h2>
        </div>
        <CarteMode
          nom="Le quiz"
          titre={`À votre rythme, de ${Math.min(...TAILLES)} à ${Math.max(...TAILLES)} questions.`}
          texte="Comparez vos réponses aux positions publiques disponibles."
          icone={<IconeQuiz taille={21} />}
          onClick={allerAuQuiz}
        />
        <CarteMode
          nom="Le duel"
          titre="Une question, un candidat, une source."
          texte="Découvrez sa position après chacune de vos réponses."
          icone={<IconeDuel taille={21} />}
          onClick={onDuel}
        />
      </section>

      {/* ── Chiffres ── */}
      <section aria-label="Le comparateur en chiffres" className="accueil-chiffres">
        <dl className="conteneur grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-4">
          {CHIFFRES.map((c) => (
            <div key={c.libelle} className="flex flex-col-reverse">
              <dt className="text-sm text-discret">{c.libelle}</dt>
              <dd className="font-titre text-4xl tracking-tight text-marine md:text-5xl">{c.valeur}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Jouer ── */}
      <Section
        id="jouer"
        bande
        surtitre="Jouer"
        titre="Choisissez votre façon de jouer."
        intro="Plus la partie est longue, plus le rapprochement est fin. Vous pouvez vous arrêter à tout moment et reprendre plus tard."
      >
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.9fr)]">
          <Carte className="overflow-hidden">
            <ChoixMode
              base={BASE_JOUER}
              libelle="Choisir un mode de jeu"
              options={[
                { id: 'quiz', libelle: 'Le quiz', icone: <IconeQuiz /> },
                { id: 'duel', libelle: 'Duel avec un candidat', icone: <IconeDuel /> },
              ]}
              valeur={mode}
              onChange={setMode}
            />
            <div role="tabpanel" id={idPanneau(BASE_JOUER, 'quiz')} aria-labelledby={idOnglet(BASE_JOUER, 'quiz')} hidden={mode !== 'quiz'} className="panneau-mode">
              <SelecteurFormat legende="Choisissez votre format" options={FORMATS} onChoisir={(id) => onCommencer(id as ModeJeu)} />
              <NoteConfiance className="mt-4">Vos réponses restent sur votre appareil.</NoteConfiance>
            </div>
            <div role="tabpanel" id={idPanneau(BASE_JOUER, 'duel')} aria-labelledby={idOnglet(BASE_JOUER, 'duel')} hidden={mode !== 'duel'} className="panneau-mode">
              <p className="surtitre surtitre-point">Comparaison en direct</p>
              <h3 className="mt-3 font-titre text-2xl tracking-tight text-marine">Un candidat. Une position à la fois.</h3>
              <p className="mt-3 max-w-prose leading-relaxed text-discret">
                Choisissez un candidat et découvrez son programme au fil de vos réponses, avec les sources.
              </p>
              <Bouton pleine fleche onClick={onDuel} className="mt-6">
                Choisir un candidat
              </Bouton>
              <NoteConfiance className="mt-4">Ce mode ne dit pas pour qui voter.</NoteConfiance>
            </div>
          </Carte>

          <aside className="flex flex-col gap-3">
            <button type="button" onClick={onDefi} className="carte flex items-center gap-3 p-4 text-left hover:border-accent">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-md bg-accent-doux text-accent">
                <IconeQuestion taille={20} />
              </span>
              <span>
                <span className="block font-titre text-lg text-marine">Défi « Qui a dit ça ? »</span>
                <span className="block text-sm leading-relaxed text-discret">Cinq positions sourcées, sans les noms. Un jeu à part, sans lien avec votre résultat.</span>
              </span>
              <IconeFleche className="ml-auto shrink-0 text-discret" />
            </button>
            <Carte douce className="flex items-start gap-3 p-4">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-md bg-accent-doux text-accent">
                <IconeBalance taille={20} />
              </span>
              <div>
                <p className="font-titre text-lg text-marine">Pas une consigne de vote.</p>
                <p className="text-sm leading-relaxed text-discret">Un score rapproche vos réponses de positions publiques : il ne vous dit pas pour qui voter.</p>
              </div>
            </Carte>
          </aside>
        </div>
      </Section>

      {/* ── Engagements ── */}
      <Section id="engagements" surtitre="Nos engagements" titre="Un comparateur que vous pouvez vérifier.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENGAGEMENTS.map((e) => (
            <Carte as="li" key={e.titre} className="border-t-4 border-t-accent p-5">
              <h3 className="font-titre text-xl text-marine">{e.titre}</h3>
              <p className="mt-2 leading-relaxed text-discret">{e.texte}</p>
            </Carte>
          ))}
        </ul>
        <Carte douce className="mt-4 grid gap-4 p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
          <h3 className="font-titre text-xl text-marine">Ce que l'outil ne fait pas</h3>
          <p className="leading-relaxed text-discret">
            Il ne vous dit pas pour qui voter. Il ne tient compte ni des personnalités, ni des sondages, ni des votes au
            Parlement. Un candidat dont les positions sont encore trop peu codées n'est pas classé : l'outil l'indique.
          </p>
        </Carte>
        <Bouton variante="lien" onClick={() => onNaviguer('methode')} className="mt-4 text-base">
          Lire la méthode complète
        </Bouton>
      </Section>

      {/* ── Candidats ── */}
      <Section
        id="candidats"
        bande
        surtitre="Les candidats"
        titre="Tout le monde à la même enseigne."
        intro="Ordre alphabétique. Aucun seuil de sondages : le critère d'inclusion est public."
      >
        <dl className="flex flex-col gap-6">
          <div>
            <dt className="font-titre text-lg text-marine">Comparés dans les résultats ({groupes.compares.length})</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {groupes.compares.map((c) => (
                <span key={c.id} className="pilule">
                  {nomComplet(c)}
                </span>
              ))}
            </dd>
          </div>
          {groupes.enAttente.length > 0 && (
            <div>
              <dt className="font-semibold">Codage en attente ({groupes.enAttente.length})</dt>
              <dd className="mt-1 leading-relaxed text-discret">{groupes.enAttente.map(nomComplet).join(', ')}</dd>
            </div>
          )}
          {groupes.nonEvalues.map(([motif, liste]) => (
            <div key={motif}>
              <dt className="font-semibold">
                Non évalués : {(MOTIFS_NON_EVALUATION[motif] ?? motif).toLowerCase()} ({liste.length})
              </dt>
              <dd className="mt-1 leading-relaxed text-discret">{liste.map(nomComplet).join(', ')}</dd>
            </div>
          ))}
        </dl>
        <Bouton variante="secondaire" onClick={() => onNaviguer('candidats')} className="mt-8">
          Fiches et critère d'inclusion
        </Bouton>
      </Section>

      {/* ── Questions fréquentes ── */}
      <Section id="faq" surtitre="Questions fréquentes" titre="Avant d'entrer dans l'isoloir.">
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {QUESTIONS_FREQUENTES.map((q) => (
            <details key={q.question} className="depliant carte px-5 py-2">
              <summary className="font-titre text-lg text-marine">{q.question}</summary>
              <p className="pt-1 pb-3 leading-relaxed text-discret">{q.reponse}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── Dernier appel et réglages ── */}
      <section className="conteneur grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col items-start justify-center gap-4 rounded-xl bg-accent p-8 text-carte md:p-10">
          <h2 className="titre-section text-carte">Cinq minutes suffisent pour une première idée.</h2>
          <p className="max-w-md text-lg leading-relaxed">Vingt propositions, puis votre rapprochement avec les candidats, sources à l'appui.</p>
          <Bouton grand variante="inverse" onClick={allerAuQuiz}>
            Choisir un format
          </Bouton>
        </div>
        <Reglages />
      </section>
    </main>
  );
}
