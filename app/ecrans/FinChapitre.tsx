import { useEffect, useRef } from 'react';
import type { Partie } from '../jeu.ts';
import { situation } from '../jeu.ts';
import { titreFinChapitre, transition } from '../habillage.ts';
import { libelleTheme } from '../libelles.ts';
import { jouer } from '../son.ts';
import { Mascotte } from './Mascotte.tsx';

interface Props {
  /** La partie, positionnée sur la première question du chapitre suivant. */
  partie: Partie;
  onContinuer: () => void;
}

/**
 * Fin de chapitre (spécification § 5.2, J1 et J3) : un court écran entre deux chapitres. Il ne parle que de la
 * progression : aucun retour sur les réponses, aucun score partiel, aucun nom de candidat ni de parti.
 */
export function FinChapitre({ partie, onContinuer }: Props) {
  const s = situation(partie);
  const fini = s.chapitre; // chapitres bouclés = indice du chapitre qui commence
  const total = partie.chapitres.length;
  const suivant = libelleTheme(s.theme);
  const bouton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    jouer('chapitre');
    bouton.current?.focus();
  }, []);

  return (
    <main className="halo flex min-h-dvh flex-col items-center justify-center gap-5 px-5 py-10 text-center">
      <Mascotte attitude="chapitre" taille={132} />
      <p className="surtitre">
        {fini} chapitre{fini > 1 ? 's' : ''} sur {total}
      </p>
      <h1 className="titre-page max-w-xl" aria-live="polite">
        {titreFinChapitre(total - fini)}
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-discret">{transition(fini - 1, partie.graine, suivant)}</p>
      <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Chapitres bouclés">
        {partie.chapitres.map((c, i) => (
          <li
            key={c.theme}
            className={`h-2.5 w-7 rounded-full ${i < fini ? 'bg-accent' : 'bg-accent/15'}`}
          >
            <span className="sr-only">{`${libelleTheme(c.theme)} : ${i < fini ? 'bouclé' : 'à venir'}`}</span>
          </li>
        ))}
      </ol>
      <button
        ref={bouton}
        type="button"
        onClick={onContinuer}
        className="btn btn-primaire btn-grand mt-2 w-full max-w-md"
      >
        Continuer : {suivant}
      </button>
    </main>
  );
}
