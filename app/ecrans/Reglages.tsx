import { useState } from 'react';
import { ecrireSon, lireSon } from '../reglages.ts';
import { jouer } from '../son.ts';
import { Carte } from '../ui/Carte.tsx';

/** Réglages de l'accueil : effets sonores (coupés par défaut). */
export function Reglages() {
  const [son, setSon] = useState(lireSon);

  return (
    <Carte as="section" aria-labelledby="titre-reglages" className="p-6">
      <h2 id="titre-reglages" className="font-titre text-xl font-bold text-marine">
        Réglages
      </h2>
      <button
        type="button"
        aria-pressed={son}
        onClick={() => {
          const suivant = !son;
          setSon(suivant);
          ecrireSon(suivant);
          if (suivant) jouer('chapitre');
        }}
        className={`mt-4 min-h-11 w-full rounded-md border px-4 text-left text-sm ${son ? 'border-accent bg-accent-doux text-accent' : 'border-trait bg-fond'}`}
      >
        <span aria-hidden="true">{son ? '♪ ' : '· '}</span>
        Effets sonores : <strong>{son ? 'activés' : 'coupés'}</strong>
      </button>
      <p className="mt-1.5 text-xs text-discret">Un petit son à l'affichage des résultats. Coupés par défaut.</p>
    </Carte>
  );
}
