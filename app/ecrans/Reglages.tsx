import { useState } from 'react';
import type { Apparence } from '../reglages.ts';
import { ecrireApparence, ecrireSon, lireApparence, lireSon } from '../reglages.ts';
import { jouer } from '../son.ts';

const APPARENCES: readonly { valeur: Apparence; libelle: string }[] = [
  { valeur: 'auto', libelle: 'Automatique' },
  { valeur: 'clair', libelle: 'Clair' },
  { valeur: 'sombre', libelle: 'Sombre' },
];

/** Réglages de l'accueil : apparence (clair, sombre, automatique) et effets sonores (coupés par défaut). */
export function Reglages() {
  const [apparence, setApparence] = useState<Apparence>(lireApparence);
  const [son, setSon] = useState(lireSon);

  return (
    <section aria-labelledby="titre-reglages" className="carte p-6">
      <h2 id="titre-reglages" className="font-titre text-xl font-bold">
        Réglages
      </h2>
      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">Apparence</legend>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {APPARENCES.map((a) => (
            <label key={a.valeur} className="segment">
              <input
                type="radio"
                className="sr-only"
                name="apparence"
                checked={apparence === a.valeur}
                onChange={() => {
                  setApparence(a.valeur);
                  ecrireApparence(a.valeur);
                }}
              />
              {a.libelle}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-discret">« Automatique » suit le réglage de votre téléphone.</p>
      </fieldset>
      <div className="mt-4">
        <button
          type="button"
          aria-pressed={son}
          onClick={() => {
            const suivant = !son;
            setSon(suivant);
            ecrireSon(suivant);
            if (suivant) jouer('chapitre');
          }}
          className={`min-h-11 w-full rounded-xl border px-4 text-left text-sm ${son ? 'border-accent bg-accent/15' : 'border-trait bg-fond'}`}
        >
          <span aria-hidden="true">{son ? '♪ ' : '· '}</span>
          Effets sonores : <strong>{son ? 'activés' : 'coupés'}</strong>
        </button>
        <p className="mt-1.5 text-xs text-discret">Un petit son à l'affichage des résultats. Coupés par défaut.</p>
      </div>
    </section>
  );
}
