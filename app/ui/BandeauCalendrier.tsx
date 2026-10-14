import { useEffect, useState } from 'react';
import { JALONS, decompte, prochainTour } from '../calendrier.ts';
import type { Jalon } from '../calendrier.ts';
import { cx } from './cx.ts';
import { Carte } from './Carte.tsx';

const UNITES: readonly { cle: 'mois' | 'jours' | 'heures' | 'minutes' | 'secondes'; singulier: string; pluriel: string }[] = [
  { cle: 'mois', singulier: 'mois', pluriel: 'mois' },
  { cle: 'jours', singulier: 'jour', pluriel: 'jours' },
  { cle: 'heures', singulier: 'heure', pluriel: 'heures' },
  { cle: 'minutes', singulier: 'minute', pluriel: 'minutes' },
  { cle: 'secondes', singulier: 'seconde', pluriel: 'secondes' },
];

function Etiquette({ statut }: { statut: Jalon['statut'] }) {
  return (
    <span className={cx('pilule px-2.5 py-0.5 text-xs', statut === 'calculé' && 'border-dashed')}>
      {statut === 'officiel' ? 'officiel' : "calculé d'après la loi, à confirmer"}
    </span>
  );
}

/**
 * Bandeau d'accueil « calendrier de l'élection » : décompte vers le prochain tour et quatre dates clés.
 * Purement informatif. `maintenant` n'est que l'instant initial (tests) ; ensuite, l'horloge est relue chaque seconde.
 * Ne rend rien une fois le 2nd tour passé.
 */
export function BandeauCalendrier({ maintenant }: { maintenant?: Date }) {
  const [instant, setInstant] = useState(() => maintenant ?? new Date());

  useEffect(() => {
    // Relecture de l'horloge à chaque tick (pas de compteur qui s'accumule) : exact après une mise en veille.
    const minuteur = setInterval(() => setInstant(new Date()), 1000);
    return () => clearInterval(minuteur);
  }, []);

  const tour = prochainTour(instant);
  if (!tour) return null;
  const reste = decompte(instant, tour.cible);

  return (
    <section aria-labelledby="titre-calendrier" className="conteneur mb-10" data-testid="calendrier">
      <Carte className="grid gap-6 p-5 md:grid-cols-2 md:gap-8 md:p-6">
        <div>
          <h2 id="titre-calendrier" className="font-titre text-xl font-semibold text-marine">
            Calendrier de l'élection
          </h2>
          <p className="mt-1 text-lg font-medium text-marine">
            {tour.nomLong} le {tour.quand}
          </p>
          <div aria-hidden="true" data-testid="decompte" className="mt-4 grid grid-cols-5 gap-2">
            {UNITES.map((u) => (
              <div key={u.cle} className="rounded-md bg-fond-bas px-1 py-2 text-center">
                <div data-testid={`decompte-${u.cle}`} className="font-titre text-2xl font-semibold text-marine tabular-nums sm:text-4xl">
                  {reste[u.cle]}
                </div>
                <div className="text-xs text-discret">{reste[u.cle] < 2 ? u.singulier : u.pluriel}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-discret">Décompte jusqu'à l'ouverture des bureaux de vote, à 8 h (heure de Paris).</p>
        </div>
        <ol className="flex flex-col gap-3">
          {JALONS.map((j) => (
            <li key={j.id} className="flex flex-col items-start gap-1">
              <span className="font-semibold text-marine">{j.titre}</span>
              <span className="text-discret">{j.quand}</span>
              <Etiquette statut={j.statut} />
            </li>
          ))}
        </ol>
      </Carte>
    </section>
  );
}
