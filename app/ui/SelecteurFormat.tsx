import type { CSSProperties } from 'react';

/**
 * Durée d'un format, en cadran de minuteur : le disque se remplit selon la part du format le plus long. Un repère de
 * temps à passer, pas un niveau de difficulté (décoratif, sans valeur).
 */
function Cadran({ part }: { part: number }) {
  return <span aria-hidden="true" className="format-cadran" style={{ '--part': `${part * 360}deg` } as CSSProperties} />;
}

export interface OptionFormat {
  id: string;
  nom: string;
  nombre: number;
  unite: string;
  /** Ligne secondaire (durée estimée). */
  detail: string;
  /** Part de la durée maximale, entre 0 et 1 : cadran décoratif. */
  part: number;
  /** Mention facultative sur la case (« Idéal pour commencer »). */
  repere?: string;
}

interface Props {
  legende: string;
  options: readonly OptionFormat[];
  /** Chaque case est une action : choisir un format ouvre la suite. */
  onChoisir: (id: string) => void;
}

/**
 * Grille de formats de partie. Le nom accessible d'une case est « Nom · N unités », suivi du détail : le texte visible
 * est le nom accessible.
 */
export function SelecteurFormat({ legende, options, onChoisir }: Props) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-3 text-sm font-bold text-discret">{legende}</legend>
      <div className="format-grille">
        {options.map((o) => (
          <button key={o.id} type="button" className="format" onClick={() => onChoisir(o.id)}>
            <span className="format-ligne">
              <span className="format-titre">
                {o.nom} · <b>{o.nombre}</b> {o.unite}
              </span>
              <Cadran part={o.part} />
            </span>
            <span className="format-detail">{o.detail}</span>
            {o.repere && <span className="format-repere">{o.repere}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
