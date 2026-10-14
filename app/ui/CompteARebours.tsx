import { useEffect, useState } from 'react';
import { decompte, prochainTour } from '../calendrier.ts';
import { Carte } from './Carte.tsx';
import { ExposantOrdinal } from './ExposantOrdinal.tsx';

const UNITES: readonly { cle: 'mois' | 'jours' | 'heures' | 'minutes' | 'secondes'; singulier: string; pluriel: string }[] = [
  { cle: 'mois', singulier: 'mois', pluriel: 'mois' },
  { cle: 'jours', singulier: 'jour', pluriel: 'jours' },
  { cle: 'heures', singulier: 'heure', pluriel: 'heures' },
  { cle: 'minutes', singulier: 'minute', pluriel: 'minutes' },
  { cle: 'secondes', singulier: 'seconde', pluriel: 'secondes' },
];

/**
 * Compte à rebours du haut de l'accueil, vers le prochain tour de l'élection. Purement informatif, et placé avant le h1 :
 * le titre est un paragraphe, pas un titre de section. C'est l'unique minuteur du calendrier.
 * `maintenant` n'est que l'instant initial (tests) ; ensuite, l'horloge est relue chaque seconde.
 * Ne rend rien une fois le 2nd tour passé.
 */
export function CompteARebours({ maintenant }: { maintenant?: Date }) {
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
    <section aria-label="Compte à rebours de l'élection" className="conteneur pt-4 md:pt-6" data-testid="compte-a-rebours">
      <Carte className="p-4 text-center md:p-6">
        <p className="font-titre text-xl font-semibold text-marine md:text-3xl"><ExposantOrdinal texte={tour.titre} /> de l'élection présidentielle de 2027</p>
        <p className="mt-1 text-discret">
          {tour.nomLong} le {tour.quand}
        </p>
        <div aria-hidden="true" data-testid="decompte" className="mx-auto mt-4 grid max-w-2xl grid-cols-5 gap-2">
          {UNITES.map((u) => (
            <div key={u.cle} className="rounded-md bg-fond-bas px-1 py-2">
              <div data-testid={`decompte-${u.cle}`} className="font-titre text-2xl font-semibold text-marine tabular-nums sm:text-4xl">
                {reste[u.cle]}
              </div>
              <div className="text-xs text-discret">{reste[u.cle] < 2 ? u.singulier : u.pluriel}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-discret">Décompte jusqu'à l'ouverture des bureaux de vote, à 8 h (heure de Paris).</p>
      </Carte>
    </section>
  );
}
