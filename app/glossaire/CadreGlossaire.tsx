import type { ReactNode } from 'react';
import { FeuilleGlossaire } from './FeuilleGlossaire.tsx';
import { useGlossaire } from './GlossaireProvider.tsx';
import { useMedia } from './media.ts';
import { PanneauGlossaire } from './PanneauGlossaire.tsx';

/** À partir de cette largeur (lg de Tailwind), le glossaire s'ouvre en panneau latéral ; en dessous, en feuille du bas. */
export const REQUETE_PANNEAU = '(min-width: 1024px)';

/** Entoure les écrans : bouton « Glossaire » persistant, et panneau ou feuille quand le glossaire est ouvert. */
export function CadreGlossaire({ children }: { children: ReactNode }) {
  const { etat, basculer } = useGlossaire();
  const large = useMedia(REQUETE_PANNEAU);
  const panneau = etat.ouvert && large;
  return (
    <>
      {/* Panneau ouvert : le contenu, centré, se recentre dans l'espace restant au lieu de passer dessous. */}
      <div className={panneau ? 'pr-96' : undefined}>{children}</div>
      <button
        type="button"
        aria-expanded={etat.ouvert}
        onClick={(e) => basculer(e.currentTarget)}
        className="bouton-glossaire fixed right-4 bottom-4 z-50 min-h-11 rounded-full border border-accent/60 bg-carte px-5 font-titre font-bold text-encre shadow-lg"
      >
        Glossaire
      </button>
      {etat.ouvert && (large ? <PanneauGlossaire /> : <FeuilleGlossaire />)}
    </>
  );
}
