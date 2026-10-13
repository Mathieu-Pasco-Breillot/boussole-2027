import { useEffect } from 'react';
import { paquet } from '../paquet.ts';
import { ENTREES } from './donnees.ts';
import { comportementDefilement, idAncre } from './etat.ts';

/**
 * Toutes les entrées, par ordre alphabétique (ordre du paquet). L'entrée demandée porte aria-current ; avec
 * `defiler`, elle est amenée dans la vue (instantanément si les animations sont réduites). Les explications ne sont
 * pas annotées : pas de sigle cliquable dans le glossaire lui-même.
 */
export function ListeGlossaire({ entree, demande, defiler }: { entree: string | null; demande: number; defiler: boolean }) {
  useEffect(() => {
    if (!defiler || !entree) return;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(idAncre(entree))?.scrollIntoView({ block: 'start', behavior: comportementDefilement(reduit) });
  }, [entree, demande, defiler]);

  return (
    <ul className="flex flex-col gap-3" aria-label="Sigles, par ordre alphabétique">
      {paquet.glossaire.map((e) => {
        const demandee = e.sigle === entree;
        return (
          <li
            key={e.sigle}
            id={idAncre(e.sigle)}
            aria-current={demandee ? 'true' : undefined}
            className={`scroll-mt-2 rounded-xl p-3 ${demandee ? 'border-l-4 border-or bg-or/15' : 'bg-nuit'}`}
          >
            <p>
              <strong>{e.sigle}</strong> — {e.developpe}
            </p>
            <p className="mt-1 text-sm text-sourdine">{e.explication}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** En tête de la feuille (téléphone) : la définition demandée, avant la liste complète. */
export function DefinitionGlossaire({ sigle }: { sigle: string }) {
  const e = ENTREES.get(sigle);
  if (!e) return null;
  return (
    <section data-definition-demandee aria-label={`Définition de ${e.sigle}`} className="mb-4 rounded-xl border-l-4 border-or bg-nuit p-3">
      <p className="font-semibold">
        {e.sigle} — {e.developpe}
      </p>
      <p className="mt-1">{e.explication}</p>
    </section>
  );
}
