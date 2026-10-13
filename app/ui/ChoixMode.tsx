import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { idOnglet, idPanneau, ongletVoisin } from './onglets.ts';

interface Option<T extends string> {
  id: T;
  libelle: string;
  icone?: ReactNode;
}

interface Props<T extends string> {
  /** Préfixe des identifiants : à reprendre pour les panneaux (idPanneau, idOnglet). */
  base: string;
  /** Nom accessible de la liste d'onglets. */
  libelle: string;
  options: readonly Option<T>[];
  valeur: T;
  onChange: (id: T) => void;
}

/**
 * Onglets pour choisir un mode (par exemple seul avec le quiz, ou en duel). Motif ARIA « tabs » : un seul onglet dans
 * l'ordre de tabulation, flèches pour passer de l'un à l'autre. Les panneaux (role="tabpanel") sont rendus par l'appelant.
 */
export function ChoixMode<T extends string>({ base, libelle, options, valeur, onChange }: Props<T>) {
  const boutons = useRef(new Map<T, HTMLButtonElement>());

  const surTouche = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const cible = ongletVoisin(index, e.key, options.length);
    if (cible === null) return;
    e.preventDefault();
    const o = options[cible]!;
    onChange(o.id);
    boutons.current.get(o.id)?.focus();
  };

  return (
    <div role="tablist" aria-label={libelle} className="choix-mode">
      {options.map((o, i) => (
        <button
          key={o.id}
          ref={(el) => {
            if (el) boutons.current.set(o.id, el);
            else boutons.current.delete(o.id);
          }}
          type="button"
          role="tab"
          id={idOnglet(base, o.id)}
          aria-selected={valeur === o.id}
          aria-controls={idPanneau(base, o.id)}
          tabIndex={valeur === o.id ? 0 : -1}
          onClick={() => onChange(o.id)}
          onKeyDown={(e) => surTouche(e, i)}
        >
          {o.icone}
          {o.libelle}
        </button>
      ))}
    </div>
  );
}
