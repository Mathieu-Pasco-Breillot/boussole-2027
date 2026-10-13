import { createElement } from 'react';
import type { HTMLAttributes } from 'react';
import { cx } from './cx.ts';

interface Props extends HTMLAttributes<HTMLElement> {
  /** Élément HTML rendu (div par défaut) : section, article, aside, li… */
  as?: 'div' | 'section' | 'article' | 'aside' | 'li' | 'p';
  /** Fond en retrait, sans ombre. */
  douce?: boolean;
  /** Liseré d'accent à gauche : une information à lire avant d'agir. */
  note?: boolean;
}

/** Surface à bordure arrondie. Le contenu et la mise en page interne restent à la charge de l'appelant. */
export function Carte({ as = 'div', douce = false, note = false, className, ...reste }: Props) {
  return createElement(as, { className: cx('carte', douce && 'carte-douce', note && 'carte-note', className), ...reste });
}
