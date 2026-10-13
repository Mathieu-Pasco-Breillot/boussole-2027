/**
 * Navigation au clavier d'une liste d'onglets (motif ARIA « tabs » à activation automatique) : flèches gauche et
 * droite (avec retour au bout), Début et Fin. Renvoie l'index à activer, ou null si la touche ne concerne pas les onglets.
 */
export function ongletVoisin(index: number, touche: string, total: number): number | null {
  if (total <= 0) return null;
  switch (touche) {
    case 'ArrowRight':
      return (index + 1) % total;
    case 'ArrowLeft':
      return (index - 1 + total) % total;
    case 'Home':
      return 0;
    case 'End':
      return total - 1;
    default:
      return null;
  }
}

/** Identifiants liés d'un onglet et de son panneau (aria-controls, aria-labelledby). */
export const idOnglet = (base: string, id: string): string => `${base}-onglet-${id}`;
export const idPanneau = (base: string, id: string): string => `${base}-panneau-${id}`;
