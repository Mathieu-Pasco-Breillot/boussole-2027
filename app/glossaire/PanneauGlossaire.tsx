import { useGlossaire } from './GlossaireProvider.tsx';
import { ListeGlossaire } from './ListeGlossaire.tsx';

/**
 * Ordinateur (≥ 1024 px) : panneau fixe à droite, non modal. Le contenu lui laisse sa largeur (CadreGlossaire) ;
 * le bouton « Glossaire » reste en bas à droite, au-dessus de la marge basse de la liste.
 */
export function PanneauGlossaire() {
  const { etat, fermer } = useGlossaire();
  return (
    <aside
      aria-labelledby="titre-panneau-glossaire"
      className="fixed inset-y-0 right-0 z-40 flex w-96 flex-col border-l border-accent/40 bg-carte text-encre"
    >
      <header className="flex items-center justify-between gap-3 border-b border-accent/30 px-4 py-3">
        <h2 id="titre-panneau-glossaire" className="font-titre text-2xl font-bold tracking-tight">
          Glossaire
        </h2>
        <button type="button" onClick={fermer} className="lien">
          Fermer le glossaire
        </button>
      </header>
      {/* Zone défilante atteignable au clavier (axe : scrollable-region-focusable). */}
      <div tabIndex={0} role="region" aria-label="Liste du glossaire" className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-24">
        <ListeGlossaire entree={etat.entree} demande={etat.demande} defiler />
      </div>
    </aside>
  );
}
