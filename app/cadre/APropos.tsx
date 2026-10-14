import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Bouton } from '../ui/Bouton.tsx';
import { IconeBalance, IconeCoche, IconeCroix } from '../ui/Icones.tsx';

/** Engagements résumés de la méthode et de la page « Vie privée » : rien qui n'y soit écrit. */
const POINTS: readonly string[] = [
  'Chaque position d’un candidat est codée à partir d’une source publique, que vous pouvez ouvrir.',
  'Le calcul se fait dans votre navigateur : aucune réponse n’est envoyée, aucune mesure d’audience n’est utilisée.',
  'Le codage avance thème par thème : un candidat encore trop peu codé sur vos questions n’est pas classé.',
];

/**
 * Tabulation bouclée dans le dialogue : le <dialog> modal rend le fond inerte, mais laisse le focus sortir vers le
 * navigateur après le dernier bouton. Ici, il revient au premier (et inversement avec Maj+Tab).
 */
function boucler(e: KeyboardEvent<HTMLDialogElement>) {
  if (e.key !== 'Tab') return;
  const boutons = e.currentTarget.querySelectorAll<HTMLElement>('button, [href]');
  const premier = boutons[0];
  const dernier = boutons[boutons.length - 1];
  if (!premier || !dernier) return;
  if (e.shiftKey && document.activeElement === premier) {
    e.preventDefault();
    dernier.focus();
  } else if (!e.shiftKey && document.activeElement === dernier) {
    e.preventDefault();
    premier.focus();
  }
}

/**
 * Dialogue « À propos » de l'en-tête : <dialog> natif ouvert en modal (fond inerte, Échap), focus bouclé. Fermeture
 * par Échap, par les boutons ou par un clic sur le fond ; l'appelant rend ensuite le focus au déclencheur.
 * Monté seulement à l'ouverture.
 */
export function APropos({ onFermer }: { onFermer: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // Pas de close() au démontage : en mode strict, il fermerait aussitôt le dialogue rouvert.
    const dialogue = ref.current;
    if (dialogue && !dialogue.open) dialogue.showModal();
  }, []);
  // close() d'abord : le fond n'est plus inerte quand l'appelant rend le focus (événement close → onFermer).
  const fermer = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="titre-a-propos"
      className="a-propos"
      onClose={onFermer}
      onKeyDown={boucler}
      onClick={(e) => {
        // Un clic sur le fond (::backdrop) cible le <dialog> lui-même ; un clic dans le contenu cible ses enfants.
        if (e.target === e.currentTarget) fermer();
      }}
    >
      <div className="a-propos-contenu">
        <button type="button" onClick={fermer} aria-label="Fermer" className="a-propos-fermer">
          <IconeCroix />
        </button>
        <span aria-hidden="true" className="a-propos-icone">
          <IconeBalance taille={20} />
        </span>
        <p className="surtitre">Indépendant et transparent</p>
        <h2 id="titre-a-propos" className="titre-section mt-3">
          Vos idées, pas notre avis.
        </h2>
        <p className="mt-2 leading-relaxed text-discret">
          Boussole est un outil citoyen d’information. Il ne soutient aucun candidat et ne recommande aucun vote.
        </p>
        <ul className="a-propos-points">
          {POINTS.map((p) => (
            <li key={p}>
              <IconeCoche taille={16} className="mt-0.5 shrink-0 text-accent" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <Bouton fleche onClick={fermer}>
          J’ai compris
        </Bouton>
      </div>
    </dialog>
  );
}
