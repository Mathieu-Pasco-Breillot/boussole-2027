import type { ReactNode } from 'react';

interface Props {
  taille?: number;
  className?: string;
}

/** Pictogramme au trait, décoratif : le texte voisin porte le sens (aria-hidden). Couleur = currentColor. */
function Icone({ taille = 18, className, children }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={taille}
      height={taille}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconeFleche = (p: Props) => (
  <Icone {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icone>
);

export const IconeBouclier = (p: Props) => (
  <Icone {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Icone>
);

export const IconeCoche = (p: Props) => (
  <Icone {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Icone>
);

/** Boussole : le quiz. */
export const IconeQuiz = (p: Props) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </Icone>
);

/** Deux flèches en sens contraire : la confrontation d'un duel. */
export const IconeDuel = (p: Props) => (
  <Icone {...p}>
    <path d="M4 7h14M14 3l4 4-4 4M20 17H6M10 13l-4 4 4 4" />
  </Icone>
);

export const IconeQuestion = (p: Props) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01" />
  </Icone>
);

export const IconeBalance = (p: Props) => (
  <Icone {...p}>
    <path d="M12 4v16M6 20h12M5 7h14" />
    <path d="m5 7-3 7a3.5 3.5 0 0 0 6 0L5 7ZM19 7l-3 7a3.5 3.5 0 0 0 6 0L19 7Z" />
  </Icone>
);
