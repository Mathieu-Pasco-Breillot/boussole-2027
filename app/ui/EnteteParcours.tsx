import type { ReactNode } from 'react';
import { Logo } from './Marque.tsx';

/** Haut des écrans de parcours : la marque (sans lien, rien ne détourne de la partie) et une action à droite (Quitter, Retour). */
export function EnteteParcours({ children }: { children?: ReactNode }) {
  return (
    <div className="parcours-haut">
      <Logo />
      {children}
    </div>
  );
}
