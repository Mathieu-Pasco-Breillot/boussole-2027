const HAUTEURS = ['h-1.5', 'h-2.5', 'h-3.5', 'h-4.5', 'h-5.5', 'h-6.5'] as const;

/** Longueur d'un format, en barres : un repère visuel, sans valeur (décoratif). */
function Longueur({ niveau }: { niveau: number }) {
  return (
    <span aria-hidden="true" className="flex items-end gap-0.5 text-accent">
      {HAUTEURS.map((h, i) => (
        <span key={h} className={`w-1.5 rounded-full bg-current ${i < niveau ? '' : 'opacity-25'} ${h}`} />
      ))}
    </span>
  );
}

export interface OptionFormat {
  id: string;
  nom: string;
  nombre: number;
  unite: string;
  /** Ligne secondaire (durée estimée). */
  detail: string;
  /** Longueur relative, de 1 à 6 : barres décoratives. */
  niveau: number;
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
              <Longueur niveau={o.niveau} />
            </span>
            <span className="format-detail">{o.detail}</span>
            {o.repere && <span className="format-repere">{o.repere}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
