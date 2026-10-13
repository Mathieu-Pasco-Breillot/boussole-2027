import type { ReactNode } from 'react';
import { ECHELLE, MODES, MOTIFS_NON_EVALUATION, THEMES } from '../libelles.ts';
import type { ModeJeu } from '../jeu.ts';
import { Reglages } from './Reglages.tsx';
import { NOM_MASCOTTE } from '../habillage.ts';
import { Mascotte } from './Mascotte.tsx';
import { groupesCandidats, nomComplet } from '../listes.ts';
import { paquet } from '../paquet.ts';
import { INTENSITE } from './Quiz.tsx';

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

const COURTS: readonly ModeJeu[] = ['express', 'debat', 'campagne'];
const LONGS: readonly ModeJeu[] = ['semi', 'marathon', 'ultra'];

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
        <span className="block font-titre text-lg font-bold">{titre}</span>
        {detail && <span className="text-sm text-discret">{detail}</span>}
      </span>
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-titre text-xl font-bold text-fond">
        →
      </span>
    </button>
  );
}

/**
 * Aperçu d'une proposition, à droite du titre : purement décoratif (masqué aux lecteurs d'écran, rien de cliquable).
 * L'énoncé est remplacé par des traits : aucun thème ni aucune mesure n'est mis en avant sur l'accueil.
 */
function Apercu() {
  return (
    <div aria-hidden="true" className="carte relative mx-auto w-full max-w-sm rotate-1 p-5 select-none">
      <div className="flex items-center justify-between text-xs font-semibold text-discret">
        <span>7 / 20</span>
        <span className="jauge w-2/3">
          <span className="block w-1/3" />
        </span>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <span className="h-3.5 w-11/12 rounded-full bg-encre/80" />
        <span className="h-3.5 w-full rounded-full bg-encre/80" />
        <span className="h-3.5 w-3/5 rounded-full bg-encre/80" />
      </div>
      <div className="mt-5 flex flex-col gap-1.5">
        {ECHELLE.map((e) => (
          <span key={e.valeur} className={`rounded-xl border px-3 py-2 text-sm font-medium ${INTENSITE[e.valeur]}`}>
            {e.libelle}
          </span>
        ))}
      </div>
      <figure className="absolute -top-12 -right-3 flex flex-col items-center sm:-right-8">
        <Mascotte attitude="accueil" taille={92} />
        <figcaption className="pilule -mt-1 px-2.5 py-0.5 text-xs">{NOM_MASCOTTE}</figcaption>
      </figure>
    </div>
  );
}

function Section({ id, surtitre, titre, intro, children, bande = false }: { id?: string; surtitre: string; titre: string; intro?: ReactNode; children: ReactNode; bande?: boolean }) {
  return (
    <section id={id} aria-labelledby={id ? `titre-${id}` : undefined} className={`scroll-mt-20 py-12 md:py-16 ${bande ? 'border-y border-trait bg-fond-bas' : ''}`}>
      <div className="conteneur">
        <p className="surtitre">{surtitre}</p>
        <h2 id={id ? `titre-${id}` : undefined} className="titre-section mt-2 max-w-2xl">
          {titre}
        </h2>
        {intro && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-discret">{intro}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

const HAUTEURS = ['h-1.5', 'h-2.5', 'h-3.5', 'h-4.5', 'h-5.5', 'h-6.5'] as const;

/** Longueur d'un format, en barres : un repère visuel, sans valeur (décoratif). */
function Longueur({ niveau }: { niveau: number }) {
  return (
    <span aria-hidden="true" className="flex items-end gap-0.5">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <span key={n} className={`w-1.5 rounded-full bg-current ${n <= niveau ? '' : 'opacity-25'} ${HAUTEURS[n - 1]}`} />
      ))}
    </span>
  );
}

const ETAPES: readonly { titre: string; texte: string }[] = [
  {
    titre: 'Vous réagissez',
    texte: "Des propositions concrètes défilent une par une, sans nom de candidat ni de parti. Vous dites si vous êtes d'accord, sur cinq crans.",
  },
  {
    titre: 'Vous pondérez',
    texte: "Une proposition compte beaucoup pour vous ? Marquez-la « très important ». Aucun avis ? Passez : elle sort du calcul.",
  },
  {
    titre: 'Vous comparez',
    texte: 'À la fin, vos réponses sont rapprochées des positions publiques des candidats. Chaque position renvoie à sa source.',
  },
];

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

  const carteMode = (mode: ModeJeu, niveau: number, vedette = false) => (
    <li key={mode}>
      <button
        type="button"
        onClick={() => onCommencer(mode)}
        className={`flex h-full w-full flex-col gap-3 rounded-2xl p-5 text-left transition-transform active:translate-y-0.5 ${
          vedette ? 'bg-accent text-fond shadow-[0_5px_0_var(--color-accent-fonce)]' : 'carte hover:border-accent'
        }`}
      >
        <span className="flex items-start justify-between gap-3">
          <span className="font-titre text-2xl leading-tight font-bold">
            {MODES[mode].nom} · {MODES[mode].questions} questions
          </span>
          <span className={vedette ? '' : 'text-accent'}>
            <Longueur niveau={niveau} />
          </span>
        </span>
        <span className={vedette ? '' : 'text-discret'}>{MODES[mode].duree}</span>
        {vedette && <span className="mt-auto w-fit rounded-full bg-fond px-3 py-1 text-sm font-bold text-accent">Idéal pour commencer</span>}
      </button>
    </li>
  );

  return (
    <main>
      {/* ── Haut de page ── */}
      <section className="halo">
        <div className="conteneur grid items-center gap-14 pt-8 pb-14 md:pt-14 md:pb-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="entree flex flex-col items-start gap-5">
            <p className="pilule">
              <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
              Présidentielle 2027 · comparateur indépendant
            </p>
            <h1 className="font-titre text-[clamp(2.4rem,1.4rem+5vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em]">
              Quels candidats pensent comme vous ? <span className="text-accent">Vérifiez à l'abri des regards.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-discret md:text-xl">
              Mon Isoloir vous soumet des propositions concrètes, puis compare vos réponses aux positions publiques des
              candidats. Chaque position est sourcée, et rien ne quitte votre téléphone.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button type="button" onClick={() => allerA('jouer')} className="btn btn-primaire btn-grand">
                Commencer le test
              </button>
              <button type="button" onClick={() => allerA('principe')} className="btn btn-secondaire btn-grand">
                Comment ça marche
              </button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-discret">
              {['Gratuit, sans inscription', 'Aucune réponse envoyée', 'Méthode et code publics'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-accent">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-10 lg:pt-0">
            <Apercu />
          </div>
        </div>
      </section>

      {/* ── Parties enregistrées sur cet appareil ── */}
      {reprises && (
        <section aria-label="Vos parties sur cet appareil" className="conteneur -mt-4 mb-10 grid gap-3 md:grid-cols-2">
          {enCours && <Reprise titre="Reprendre la partie en cours" detail="Vous retrouvez vos réponses là où vous les avez laissées." onClick={onReprendre} />}
          {terminee && <Reprise titre="Revoir mon dernier résultat" onClick={onVoirResultats} />}
          {duelEnCours && <Reprise titre="Reprendre le duel en cours" detail="Vous retrouvez vos réponses là où vous les avez laissées." onClick={onReprendreDuel} />}
          {duelTermine && <Reprise titre="Revoir mon dernier duel" onClick={onVoirResultatsDuel} />}
        </section>
      )}

      {/* ── Chiffres ── */}
      <section aria-label="Le comparateur en chiffres" className="border-y border-trait bg-fond-bas">
        <dl className="conteneur grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-4">
          {CHIFFRES.map((c) => (
            <div key={c.libelle} className="flex flex-col-reverse">
              <dt className="text-sm text-discret">{c.libelle}</dt>
              <dd className="font-titre text-4xl font-extrabold tracking-tight md:text-5xl">{c.valeur}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Le principe ── */}
      <Section
        id="principe"
        surtitre="Le principe"
        titre="Trois temps, à votre rythme."
        intro="Pas de profil à créer, pas de question piège. Vous réagissez, l'outil rapproche, vous vérifiez."
      >
        <ol className="grid gap-4 md:grid-cols-3">
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="carte p-6">
              <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-accent/12 font-titre text-xl font-extrabold text-accent">
                {i + 1}
              </span>
              <h3 className="mt-4 font-titre text-xl font-bold">{e.titre}</h3>
              <p className="mt-2 leading-relaxed text-discret">{e.texte}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Jouer ── */}
      <Section
        id="jouer"
        bande
        surtitre="Jouer"
        titre="Choisissez votre format."
        intro="Plus la partie est longue, plus le rapprochement est fin. Vous pouvez vous arrêter à tout moment et reprendre plus tard."
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {COURTS.map((m, i) => carteMode(m, i + 1, i === 0))}
        </ul>
        <h3 className="mt-8 font-titre text-lg font-bold">Pour les endurants</h3>
        <ul className="mt-3 grid gap-4 md:grid-cols-3">
          {LONGS.map((m, i) => carteMode(m, i + 4))}
        </ul>

        <h3 className="mt-10 font-titre text-lg font-bold">Deux autres façons de jouer</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <button type="button" onClick={onDuel} className="carte flex flex-col gap-2 p-5 text-left hover:border-accent">
            <span className="font-titre text-2xl font-bold">Duel avec un candidat</span>
            <span className="leading-relaxed text-discret">Choisissez un candidat et découvrez son programme au fil de vos réponses, avec les sources.</span>
          </button>
          <button type="button" onClick={onDefi} className="carte flex flex-col gap-2 p-5 text-left hover:border-accent">
            <span className="font-titre text-2xl font-bold">Défi « Qui a dit ça ? »</span>
            <span className="leading-relaxed text-discret">Cinq positions sourcées, sans les noms. Un jeu à part, sans lien avec votre résultat.</span>
          </button>
        </div>
      </Section>

      {/* ── Engagements ── */}
      <Section id="engagements" surtitre="Nos engagements" titre="Un comparateur que vous pouvez vérifier.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENGAGEMENTS.map((e) => (
            <li key={e.titre} className="carte border-t-4 border-t-accent p-5">
              <h3 className="font-titre text-xl font-bold">{e.titre}</h3>
              <p className="mt-2 leading-relaxed text-discret">{e.texte}</p>
            </li>
          ))}
        </ul>
        <div className="carte mt-4 grid gap-4 p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
          <h3 className="font-titre text-xl font-bold">Ce que l'outil ne fait pas</h3>
          <p className="leading-relaxed text-discret">
            Il ne vous dit pas pour qui voter. Il ne tient compte ni des personnalités, ni des sondages, ni des votes au
            Parlement. Un candidat dont les positions sont encore trop peu codées n'est pas classé : l'outil l'indique.
          </p>
        </div>
        <button type="button" onClick={() => onNaviguer('methode')} className="lien mt-4 text-base">
          Lire la méthode complète
        </button>
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
            <dt className="font-titre text-lg font-bold">Comparés dans les résultats ({groupes.compares.length})</dt>
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
        <button type="button" onClick={() => onNaviguer('candidats')} className="btn btn-secondaire mt-8">
          Fiches et critère d'inclusion
        </button>
      </Section>

      {/* ── Questions fréquentes ── */}
      <Section id="faq" surtitre="Questions fréquentes" titre="Avant d'entrer dans l'isoloir.">
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {QUESTIONS_FREQUENTES.map((q) => (
            <details key={q.question} className="depliant carte px-5 py-2">
              <summary className="font-titre text-lg font-bold">{q.question}</summary>
              <p className="pt-1 pb-3 leading-relaxed text-discret">{q.reponse}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── Dernier appel et réglages ── */}
      <section className="conteneur grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col items-start justify-center gap-4 rounded-3xl bg-accent p-8 text-fond md:p-10">
          <h2 className="titre-section">Cinq minutes suffisent pour une première idée.</h2>
          <p className="max-w-md text-lg leading-relaxed">Vingt propositions, puis votre rapprochement avec les candidats, sources à l'appui.</p>
          <button type="button" onClick={() => allerA('jouer')} className="btn btn-grand bg-fond text-encre shadow-[0_4px_0_var(--color-accent-fonce)] active:translate-y-0.5">
            Choisir un format
          </button>
        </div>
        <Reglages />
      </section>
    </main>
  );
}
