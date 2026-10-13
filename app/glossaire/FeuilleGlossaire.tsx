import { useEffect, useRef } from 'react';
import { useGlossaire } from './GlossaireProvider.tsx';
import { DefinitionGlossaire, ListeGlossaire } from './ListeGlossaire.tsx';

/**
 * Téléphone et tablette (< 1024 px) : feuille du bas, <dialog> natif ouvert en modal (focus piégé, fond inerte,
 * Échap). Fermeture par Échap (événement close), par le bouton ou par un tap sur le fond ; le fournisseur rend
 * ensuite le focus au déclencheur. Montée seulement à l'ouverture : démontée, elle quitte la couche supérieure.
 */
export function FeuilleGlossaire() {
  const { etat, fermer } = useGlossaire();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // Pas de close() au démontage : en mode strict, il fermerait aussitôt la feuille rouverte.
    const dialogue = ref.current;
    if (dialogue && !dialogue.open) dialogue.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-modal="true"
      aria-labelledby="titre-feuille-glossaire"
      className="feuille-glossaire"
      onClose={fermer}
      onClick={(e) => {
        // Un clic sur le fond (::backdrop) cible le <dialog> lui-même ; un clic dans la feuille cible son contenu.
        if (e.target === e.currentTarget) fermer();
      }}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-or/30 px-4 py-3">
          <h2 id="titre-feuille-glossaire" className="font-serif text-2xl font-semibold">
            Glossaire
          </h2>
          <button type="button" onClick={fermer} className="min-h-11 text-sm text-sourdine underline">
            Fermer le glossaire
          </button>
        </header>
        <div tabIndex={0} role="region" aria-label="Liste du glossaire" className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-6">
          {etat.entree && <DefinitionGlossaire sigle={etat.entree} />}
          <ListeGlossaire entree={etat.entree} demande={etat.demande} defiler={false} />
        </div>
      </div>
    </dialog>
  );
}
