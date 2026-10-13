import { CHARGEMENT } from '../habillage.ts';
import { Mascotte } from './Mascotte.tsx';

/** Écran d'attente des pages chargées à la demande (J1, J3). */
export function Chargement() {
  return (
    <main className="colonne flex min-h-[60dvh] flex-col items-center justify-center gap-3 text-center">
      <Mascotte attitude="attente" taille={88} />
      <p role="status" className="text-discret">
        {CHARGEMENT}
      </p>
    </main>
  );
}
