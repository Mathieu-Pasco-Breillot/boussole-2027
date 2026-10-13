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
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { EnteteParcours } from '../ui/EnteteParcours.tsx';

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
    <main className="parcours gap-6">
      <EnteteParcours />

      <header>
        <p className="surtitre surtitre-point">Résultat du duel</p>
        <h1 className="titre-page mt-3">{nom}</h1>
        <p className="mt-3 text-discret">
          {c.parti} · {taille} · {a.repondues} réponses sur {partie.questions.length} propositions · graine du tirage {partie.graine}
        </p>
      </header>

      <Carte as="section" note className="p-5" aria-labelledby="titre-affinite">
        <h2 id="titre-affinite" className="titre-carte">
          Votre affinité avec ce programme
        </h2>
        {a.affichable && a.score.scoreArrondi !== null ? (
          <>
            <p className="score score-grand mt-3" aria-label={`Affinité ${a.score.scoreArrondi} sur 100`}>
              {a.score.scoreArrondi} <span className="score-unite">/ 100</span>
            </p>
            <progress className="barre barre-epaisse mt-3" data-barre-score aria-hidden="true" max={100} value={a.score.scoreArrondi} />
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
      </Carte>

      {a.affichable && <Detail s={a} />}

      <section>
        <button type="button" aria-expanded={toutes} onClick={() => setToutes((v) => !v)} className="lien-titre titre-carte">
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
                  <li key={id} className="ligne-position">
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

      <Carte as="section" douce className="p-5 text-sm leading-relaxed text-discret">
        <p>Les votes au Parlement n'entrent ni dans le codage des positions ni dans le score. Indicateur de votes : pas encore disponible.</p>
        <p className="mt-2">
          Même graine et mêmes réponses redonnent les mêmes résultats. Méthode complète et données :{' '}
          <a className="lien-texte" href="https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027" rel="noopener noreferrer">
            dépôt du projet
          </a>
          .
        </p>
      </Carte>

      <div className="flex flex-col gap-3">
        <Bouton grand pleine fleche onClick={onAutreDuel}>
          Faire un duel avec un autre candidat
        </Bouton>
        <Bouton variante="secondaire" pleine onClick={() => onFiche(partie.candidat)}>
          Fiche de {nom}
        </Bouton>
        <Bouton variante="secondaire" pleine onClick={onAccueil}>
          Lancer une partie classique
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
    </main>
  );
}
