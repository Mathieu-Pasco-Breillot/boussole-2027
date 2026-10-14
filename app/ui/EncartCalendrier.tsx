import { JALONS, prochainTour } from '../calendrier.ts';
import type { Jalon } from '../calendrier.ts';
import { cx } from './cx.ts';
import { Carte } from './Carte.tsx';
import { ExposantOrdinal } from './ExposantOrdinal.tsx';

function Etiquette({ statut }: { statut: Jalon['statut'] }) {
  return (
    <span className={cx('pilule px-2.5 py-0.5 text-xs', statut === 'calculé' && 'border-dashed')}>
      {statut === 'officiel' ? 'officiel' : "calculé d'après la loi"}
    </span>
  );
}

/**
 * Encart d'accueil « calendrier de l'élection » : les quatre dates clés, en une colonne sur mobile et deux sur desktop.
 * Purement informatif et sans minuteur : l'instant est lu une seule fois par rendu (`maintenant` pour les tests) pour
 * disparaître, comme le compte à rebours, une fois le 2nd tour passé.
 */
export function EncartCalendrier({ maintenant }: { maintenant?: Date }) {
  if (!prochainTour(maintenant ?? new Date())) return null;

  return (
    <section aria-labelledby="titre-calendrier" className="conteneur mb-10" data-testid="calendrier">
      <Carte className="p-5 md:p-6">
        <h2 id="titre-calendrier" className="font-titre text-xl font-semibold text-marine">
          Calendrier de l'élection
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-8">
          {JALONS.map((j) => (
            <li key={j.id} className="flex flex-col items-start gap-1">
              <span className="font-semibold text-marine"><ExposantOrdinal texte={j.titre} /></span>
              <span className="text-discret">{j.quand}</span>
              <Etiquette statut={j.statut} />
            </li>
          ))}
        </ol>
      </Carte>
    </section>
  );
}
