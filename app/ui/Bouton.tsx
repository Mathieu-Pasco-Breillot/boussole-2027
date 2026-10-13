import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx.ts';
import { IconeFleche } from './Icones.tsx';

type Variante = 'primaire' | 'secondaire' | 'inverse' | 'lien';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  grand?: boolean;
  /** Prend toute la largeur disponible. */
  pleine?: boolean;
  /** Ajoute une flèche à droite du libellé (décorative). */
  fleche?: boolean;
}

/** Bouton du site. Le libellé reste le nom accessible : la flèche est un pictogramme décoratif. */
export function Bouton({ variante = 'primaire', grand = false, pleine = false, fleche = false, className, type = 'button', children, ...reste }: Props) {
  const classes = variante === 'lien' ? cx('lien', className) : cx('btn', `btn-${variante}`, grand && 'btn-grand', pleine && 'w-full', className);
  return (
    <button type={type} className={classes} {...reste}>
      {children}
      {fleche && <IconeFleche />}
    </button>
  );
}
