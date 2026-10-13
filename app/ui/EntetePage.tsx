import type { ReactNode } from 'react';

interface Props {
  titre: ReactNode;
  onRetour: () => void;
  libelleRetour?: string;
  /** Étiquette au-dessus du titre. */
  surtitre?: string;
  /** Pastille ou autre repère à gauche du titre. */
  repere?: ReactNode;
  /** Introduction sous le titre. */
  children?: ReactNode;
}

/** Haut d'une page du site (candidats, questions, méthode, fiche, vie privée) : retour, titre, introduction. */
export function EntetePage({ titre, onRetour, libelleRetour = '← Retour', surtitre, repere, children }: Props) {
  return (
    <header className="entete-page">
      <button type="button" onClick={onRetour} className="lien">
        {libelleRetour}
      </button>
      <div className="entete-page-titre">
        {repere}
        <div>
          {surtitre && <p className="surtitre surtitre-point">{surtitre}</p>}
          <h1 className="titre-page">{titre}</h1>
        </div>
      </div>
      {children && <div className="entete-page-intro">{children}</div>}
    </header>
  );
}
