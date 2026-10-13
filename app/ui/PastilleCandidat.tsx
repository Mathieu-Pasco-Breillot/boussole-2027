import { cx } from './cx.ts';
import { initiales } from './initiales.ts';

type Teinte = 'ciel' | 'sauge' | 'peche';

interface Props {
  prenom: string;
  nom: string;
  grande?: boolean;
  /** Teinte de la pastille (classe, pas de style en ligne). Par défaut « ciel » : aucune couleur n'est liée à un camp. */
  teinte?: Teinte;
}

/** Pastille d'initiales. Décorative : le nom complet est toujours écrit à côté. */
export function PastilleCandidat({ prenom, nom, grande = false, teinte = 'ciel' }: Props) {
  return (
    <span className={cx('pastille', grande && 'pastille-grande')} data-teinte={teinte} aria-hidden="true">
      {initiales(prenom, nom)}
    </span>
  );
}
