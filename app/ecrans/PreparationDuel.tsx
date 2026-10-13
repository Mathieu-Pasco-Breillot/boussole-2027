import { useMemo, useState } from 'react';
import type { TailleDuel } from '../../core/duel/index.ts';
import { PROPOSITIONS_MIN_DUEL } from '../../core/duel/index.ts';
import type { PoidsTheme } from '../../core/tirage/index.ts';
import { candidatsDuel, ordreAleatoire, propositionsParChapitre } from '../duel.ts';
import type { PreparationDuel as PreparationChoisie } from '../duel.ts';
import { nouvelleGraine } from '../jeu.ts';
import { libelleTheme, TAILLES_DUEL_INFO } from '../libelles.ts';
import { lireVues } from '../stockage.ts';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { EnteteParcours } from '../ui/EnteteParcours.tsx';
import { PastilleCandidat } from '../ui/PastilleCandidat.tsx';

interface Props {
  onLancer: (candidat: string, taille: TailleDuel, preparation: PreparationChoisie) => void;
  onRetour: () => void;
}

const NIVEAUX: readonly { poids: PoidsTheme; libelle: string }[] = [
  { poids: 0, libelle: 'Écarter' },
  { poids: 1, libelle: 'Normal' },
  { poids: 2, libelle: 'Important' },
  { poids: 3, libelle: 'Prioritaire' },
];

const tous = candidatsDuel();

export function PreparationDuel({ onLancer, onRetour }: Props) {
  const [choix, setChoix] = useState<string | null>(null);
  const [taille, setTaille] = useState<TailleDuel>(40);
  const [poids, setPoids] = useState<Record<string, PoidsTheme>>({});
  // Ordre d'affichage tiré au sort à chaque ouverture : ni classement, ni ordre qui avantage un nom.
  const graineOrdre = useMemo(() => nouvelleGraine(), []);
  const disponibles = useMemo(() => ordreAleatoire(tous.filter((c) => c.disponible), graineOrdre), [graineOrdre]);
  const indisponibles = tous.filter((c) => !c.disponible);

  if (choix === null) {
    return (
      <main className="parcours gap-7 pb-10">
        <EnteteParcours>
          <button type="button" onClick={onRetour} className="lien">
            ← Retour
          </button>
        </EnteteParcours>
        <header>
          <p className="surtitre surtitre-point">Mode Duel</p>
          <h1 className="titre-page mt-3">Duel avec un candidat</h1>
          <p className="mt-3 leading-relaxed text-discret">
            Choisissez un candidat. On vous propose ses positions une par une ; après chacune de vos réponses, vous
            découvrez ce qu'il ou elle porte, avec la source, et votre affinité se met à jour.
          </p>
          <Carte as="p" note className="mt-4 p-4 text-sm leading-relaxed">
            Ce mode ne dit pas pour qui voter. Les propositions posées dépendent du candidat : <strong>le score d'un duel n'est
            comparable ni à celui d'un autre candidat, ni au classement des autres modes.</strong>
          </Carte>
        </header>

        <section aria-labelledby="titre-candidats">
          <h2 id="titre-candidats" className="font-titre text-2xl font-semibold tracking-tight text-marine">
            Avec quel candidat ?
          </h2>
          <p className="mt-1 text-sm text-discret">Ordre tiré au sort à chaque ouverture de cet écran.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {disponibles.map(({ candidat, propositions }) => (
              <li key={candidat.id}>
                <button type="button" onClick={() => setChoix(candidat.id)} className="option-candidat w-full justify-between">
                  <PastilleCandidat prenom={candidat.prenom} nom={candidat.nom} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {candidat.prenom} {candidat.nom}
                    </span>
                    <span className="block text-xs text-discret">{candidat.parti}</span>
                  </span>
                  <span className="pilule shrink-0 bg-fond text-xs text-discret">{propositions} propositions</span>
                </button>
              </li>
            ))}
          </ul>
          {indisponibles.length > 0 && (
            <div className="mt-5">
              <h3 className="font-semibold">Pas encore assez de propositions</h3>
              <p className="mt-1 text-sm text-discret">
                Il en faut au moins {PROPOSITIONS_MIN_DUEL} pour un duel. Le codage se poursuit, candidat par candidat.
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-discret">
                {indisponibles.map(({ candidat, propositions }) => (
                  <li key={candidat.id} className="flex justify-between border-b border-trait py-1">
                    <span>
                      {candidat.prenom} {candidat.nom}
                    </span>
                    <span>{propositions} sur {PROPOSITIONS_MIN_DUEL} requises</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    );
  }

  const fiche = tous.find((c) => c.candidat.id === choix)!;
  const parChapitre = propositionsParChapitre(choix);
  const chapitres = [...parChapitre.keys()].sort();
  const poidsDe = (t: string): PoidsTheme => poids[t] ?? 1;
  const actifs = chapitres.filter((t) => poidsDe(t) !== 0);
  const disponiblesApresReglage = actifs.reduce((n, t) => n + (parChapitre.get(t) ?? 0), 0);
  const vues = new Set(lireVues().map((v) => v.id));
  const prevues = taille === 'tout' ? disponiblesApresReglage : Math.min(taille, disponiblesApresReglage);

  return (
    <main className="parcours gap-7">
      <EnteteParcours>
        <button type="button" onClick={() => setChoix(null)} className="lien">
          ← Choisir un autre candidat
        </button>
      </EnteteParcours>
      <header>
        <p className="surtitre surtitre-point">Mode Duel</p>
        <div className="mt-3 flex items-center gap-3">
          <PastilleCandidat prenom={fiche.candidat.prenom} nom={fiche.candidat.nom} grande />
          <h1 className="titre-page">
            {fiche.candidat.prenom} {fiche.candidat.nom}
          </h1>
        </div>
        <p className="mt-2 text-discret">{fiche.candidat.parti} · {fiche.propositions} propositions disponibles</p>
        <Carte as="p" note className="mt-4 p-4 text-sm leading-relaxed" role="status" data-propositions-prevues={prevues}>
          Avec ces réglages : <strong>{disponiblesApresReglage} propositions disponibles</strong>
          {vues.size > 0 ? ' (celles déjà vues sur cet appareil passent en dernier)' : ''}. Le duel comptera <strong>{prevues}</strong> propositions.
        </Carte>
      </header>

      <section aria-labelledby="titre-taille">
        <h2 id="titre-taille" className="font-titre text-2xl font-semibold tracking-tight text-marine">
          Combien de propositions ?
        </h2>
        <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label="Nombre de propositions">
          {TAILLES_DUEL_INFO.map((t) => (
            <label key={String(t.taille)} className="segment justify-between gap-3 px-4 py-3 text-base">
              <input type="radio" className="sr-only" name="taille-duel" checked={taille === t.taille} onChange={() => setTaille(t.taille)} />
              <span>{t.nom}</span>
              <span className="text-sm opacity-80">{t.duree}</span>
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="titre-poids">
        <h2 id="titre-poids" className="font-titre text-2xl font-semibold tracking-tight text-marine">
          Ce qui compte pour vous
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-discret">
          Un thème « important » reçoit plus de propositions et pèse plus dans l'affinité ; « écarter » le retire du duel et
          du calcul.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {chapitres.map((t) => (
            <Carte as="li" key={t} className="p-4">
              <fieldset>
                <legend className="font-titre text-lg font-semibold text-marine">
                  {libelleTheme(t)} <span className="text-sm font-normal text-discret">({parChapitre.get(t)} propositions)</span>
                </legend>
                <div className="mt-2 grid grid-cols-4 gap-1" role="radiogroup" aria-label={`Importance du thème ${libelleTheme(t)}`}>
                  {NIVEAUX.map((n) => (
                    <label key={n.poids} className="segment">
                      <input
                        type="radio"
                        className="sr-only"
                        name={`poids-duel-${t}`}
                        checked={poidsDe(t) === n.poids}
                        onChange={() => setPoids((p) => ({ ...p, [t]: n.poids }))}
                      />
                      {n.libelle}
                    </label>
                  ))}
                </div>
              </fieldset>
            </Carte>
          ))}
        </ul>
      </section>

      <div data-barre-action className="barre-action mt-auto">
        <Bouton
          grand
          pleine
          fleche
          disabled={actifs.length === 0}
          onClick={() => onLancer(choix, taille, { poids: Object.fromEntries(chapitres.map((t) => [t, poidsDe(t)])) })}
        >
          Lancer le duel{actifs.length > 0 ? ` (${prevues} propositions)` : ''}
        </Bouton>
        {actifs.length === 0 && <p className="mt-2 text-sm text-discret">Gardez au moins un thème pour lancer le duel.</p>}
      </div>
    </main>
  );
}
