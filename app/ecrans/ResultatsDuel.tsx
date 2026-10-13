import { useMemo, useState } from 'react';
import { Extraits } from './Extraits.tsx';
import { qualifierEcart } from '../../core/duel/index.ts';
import type { PartieDuel } from '../duel.ts';
import { affiniteDePartie, positionSur } from '../duel.ts';
import { questionsParId } from '../jeu.ts';
import { ECARTS, libelleTheme, libelleValeur, NATURES, TAILLES_DUEL_INFO } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { Detail } from './Resultats.tsx';
import { Texte } from '../glossaire/Texte.tsx';

interface Props {
  partie: PartieDuel;
  onFiche: (id: string) => void;
  onAutreDuel: () => void;
  onAccueil: () => void;
  onVieprivee: () => void;
  onToutEffacer: () => void;
}

/** Résultat d'un duel : affinité avec le candidat choisi, détail, et toutes les propositions rencontrées avec leurs sources. */
export function ResultatsDuel({ partie, onFiche, onAutreDuel, onAccueil, onVieprivee, onToutEffacer }: Props) {
  const a = useMemo(() => affiniteDePartie(partie), [partie]);
  const [toutes, setToutes] = useState(false);
  const c = paquet.candidats.find((x) => x.id === partie.candidat)!;
  const nom = `${c.prenom} ${c.nom}`;
  const taille = TAILLES_DUEL_INFO.find((t) => t.taille === partie.taille)!.nom;

  return (
    <main className="colonne flex max-w-3xl flex-col gap-6 py-8">
      <header>
        <p className="surtitre">Résultat du duel</p>
        <h1 className="titre-page mt-2">{nom}</h1>
        <p className="mt-2 text-discret">
          {c.parti} · {taille} · {a.repondues} réponses sur {partie.questions.length} propositions · graine du tirage {partie.graine}
        </p>
      </header>

      <section className="carte border-l-4 border-l-accent p-5" aria-labelledby="titre-affinite">
        <h2 id="titre-affinite" className="font-titre text-xl font-bold">
          Votre affinité avec ce programme
        </h2>
        {a.affichable && a.score.scoreArrondi !== null ? (
          <>
            <p className="mt-2 font-titre text-6xl font-extrabold tracking-tight tabular-nums" aria-label={`Affinité ${a.score.scoreArrondi} sur 100`}>
              {a.score.scoreArrondi} <span className="text-xl text-discret">/ 100</span>
            </p>
            <div className="jauge mt-3">
              <div data-barre-score style={{ width: `${a.score.scoreArrondi}%` }} />
            </div>
            <p className="mt-3 text-sm text-discret">
              Fiabilité {a.fiabilite} · {a.score.codees} propositions comptées sur {a.repondues} répondues.
            </p>
          </>
        ) : (
          <p className="mt-2 leading-relaxed">
            Pas de score : il faut au moins 8 propositions répondues (vous en avez {a.score.codees}). Vous pouvez tout de même relire ci-dessous ce
            que {nom} porte sur ces propositions, avec les sources.
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-discret">
          Ce score mesure votre accord avec les propositions de {nom} que vous avez rencontrées. Il n'est comparable ni à celui d'un duel avec un autre
          candidat, ni au classement des autres modes : les propositions posées ne sont pas les mêmes. Ce n'est ni une victoire, ni un échec pour personne.
        </p>
      </section>

      {a.affichable && <Detail s={a} />}

      <section>
        <button type="button" aria-expanded={toutes} onClick={() => setToutes((v) => !v)} className="min-h-11 text-left font-titre text-xl font-bold underline decoration-accent/50 decoration-2 underline-offset-4">
          Toutes les propositions rencontrées ({a.repondues}) {toutes ? '▴' : '▾'}
        </button>
        {toutes && (
          <ul className="mt-3 flex flex-col gap-2">
            {partie.questions
              .filter((id) => partie.reponses[id] !== undefined)
              .map((id) => {
                const q = questionsParId.get(id)!;
                const saisie = partie.reponses[id]!;
                const p = positionSur(partie, id);
                return (
                  <li key={id} className="carte p-4 text-sm leading-relaxed shadow-none">
                    <p className="font-semibold">
                      <Texte>{q.enonce}</Texte>
                    </p>
                    <p className="text-discret">{libelleTheme(q.theme)}</p>
                    <p className="mt-1">
                      Votre réponse : <strong>{saisie.valeur === 'sans_avis' ? 'sans avis' : libelleValeur(saisie.valeur)}</strong>
                    </p>
                    {p && p.code !== null && (
                      <p>
                        Sa position : <strong>{libelleValeur(p.code)}</strong> ({p.nature ? (NATURES[p.nature] ?? p.nature) : ''})
                        {saisie.valeur !== 'sans_avis' ? ` · ${ECARTS[qualifierEcart(4 - Math.abs(saisie.valeur - p.code))]}` : ''}
                      </p>
                    )}
                    <Extraits extraits={p?.extraits} className="mt-2" />
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      <section className="carte p-5 text-sm leading-relaxed text-discret">
        <p>Les votes au Parlement n'entrent ni dans le codage des positions ni dans le score. Indicateur de votes : pas encore disponible.</p>
        <p className="mt-2">
          Même graine et mêmes réponses redonnent les mêmes résultats. Méthode complète et données :{' '}
          <a className="underline" href="https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027" rel="noopener noreferrer">
            dépôt du projet
          </a>
          .
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <button type="button" onClick={onAutreDuel} className="btn btn-primaire btn-grand">
          Faire un duel avec un autre candidat
        </button>
        <button type="button" onClick={() => onFiche(partie.candidat)} className="btn btn-secondaire">
          Fiche de {nom}
        </button>
        <button type="button" onClick={onAccueil} className="btn btn-secondaire">
          Lancer une partie classique
        </button>
        <button type="button" onClick={onVieprivee} className="lien">
          Vie privée
        </button>
        <button type="button" onClick={onToutEffacer} className="lien">
          Tout effacer sur cet appareil
        </button>
      </div>
    </main>
  );
}
