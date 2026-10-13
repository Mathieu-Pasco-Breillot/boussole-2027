import { cx } from './cx.ts';
import { initiales } from './initiales.ts';

interface Props {
  prenom: string;
  nom: string;
  grande?: boolean;
}

/** Pastille d'initiales, d'une seule teinte (aucune couleur n'est liée à un camp). Décorative : le nom complet est toujours écrit à côté. */
export function PastilleCandidat({ prenom, nom, grande = false }: Props) {
  return (
    <span className={cx('pastille', grande && 'pastille-grande')} aria-hidden="true">
      {initiales(prenom, nom)}
    </span>
  );
}
