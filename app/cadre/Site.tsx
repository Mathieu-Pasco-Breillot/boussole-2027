import type { ReactNode } from 'react';
import { LigneVersions } from '../ecrans/Versions.tsx';
import { Bouton } from '../ui/Bouton.tsx';
import { EnTete, LienNav } from '../ui/EnTete.tsx';
import { Logo } from '../ui/Marque.tsx';

/** Rubriques de la navigation principale. « Jouer » mène au choix du format, sur l'accueil. */
export type Rubrique = 'accueil' | 'jouer' | 'candidats' | 'banque' | 'methode';

const DEPOT = 'https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027';

const RUBRIQUES: readonly { id: Rubrique; libelle: string }[] = [
  { id: 'accueil', libelle: 'Accueil' },
  { id: 'jouer', libelle: 'Jouer' },
  { id: 'candidats', libelle: 'Candidats' },
  { id: 'banque', libelle: 'Questions' },
  { id: 'methode', libelle: 'Méthode' },
];

/** Pictogrammes de la barre d'onglets : traits simples, décoratifs (le libellé porte le nom). */
function Picto({ id }: { id: Rubrique }) {
  const traits: Record<Rubrique, ReactNode> = {
    accueil: <path d="M4 11.5 12 5l8 6.5M6.5 10v9h11v-9" />,
    jouer: (
      <>
        <rect x="4" y="10" width="16" height="10" rx="2.5" />
        <path d="M9 10V6.5h6V10M9.5 14.5h5" />
      </>
    ),
    candidats: (
      <>
        <circle cx="9" cy="9" r="3" />
        <path d="M3.5 19c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5M15.5 6.5a3 3 0 0 1 0 5.5M17.5 14.5c1.6.7 2.6 2.2 3 4.5" />
      </>
    ),
    banque: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="2.5" />
        <path d="M9 9h6M9 12.5h6M9 16h3.5" />
      </>
    ),
    methode: (
      <>
        <path d="M12 6.5c-2-1.3-4.5-1.6-7.5-1v12.5c3-.6 5.5-.3 7.5 1 2-1.3 4.5-1.6 7.5-1V5.500c-3-.6-5.5-.3-7.5 1Z" />
        <path d="M12 6.500V19" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {traits[id]}
    </svg>
  );
}

interface Props {
  /** Rubrique mise en avant dans la navigation (aucune sur la page « Vie privée »). */
  actif: Rubrique | null;
  onAller: (r: Rubrique) => void;
  onVieprivee: () => void;
  /** « Tout effacer » dans le pied de page : sur l'accueil seulement (la page « Vie privée » a son propre bouton). */
  onToutEffacer?: () => void;
  children: ReactNode;
}

/**
 * Cadre des pages du site (accueil, candidats, questions, méthode, vie privée) : en-tête, pied de page et, sur
 * téléphone, barre d'onglets en bas de l'écran. Les écrans de parcours (préparation, quiz, résultats, duel, défi)
 * n'ont pas ce cadre : rien ne détourne de la partie en cours.
 * Une seule des deux navigations est affichée à la fois (onglets sous 768 px, en-tête au-delà).
 */
export function Site({ actif, onAller, onVieprivee, onToutEffacer, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <EnTete
        logo={
          <button type="button" onClick={() => onAller('accueil')} className="flex min-h-11 items-center" aria-label="Boussole : retour à l'accueil">
            <Logo />
          </button>
        }
        navigation={
          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {RUBRIQUES.filter((r) => r.id !== 'jouer').map((r) => (
                <li key={r.id}>
                  <LienNav actif={actif === r.id} onClick={() => onAller(r.id)}>
                    {r.libelle}
                  </LienNav>
                </li>
              ))}
              <li className="ml-3">
                <Bouton onClick={() => onAller('jouer')}>Jouer</Bouton>
              </li>
            </ul>
          </nav>
        }
      />

      <div className="flex-1">{children}</div>

      <footer className="mt-16 border-t border-trait bg-fond-bas">
        <div className="conteneur grid gap-8 py-10 text-sm text-discret md:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-3">
            <Logo petit />
            <p className="max-w-prose leading-relaxed">
              Version de démonstration : les positions des candidats sont codées au fil de l'eau, thème par thème. Pour
              l'instant, le codage est partiel : les résultats sont à lire avec prudence.
            </p>
            <LigneVersions />
          </div>
          <nav aria-label="Informations" className="flex flex-col items-start gap-1 md:items-end">
            <button type="button" onClick={onVieprivee} className="lien">
              Vie privée
            </button>
            <a className="lien" href={DEPOT} rel="noopener noreferrer">
              Méthode, données et code source
            </a>
            {onToutEffacer && (
              <button type="button" onClick={onToutEffacer} className="lien">
                Tout effacer sur cet appareil
              </button>
            )}
          </nav>
        </div>
      </footer>

      <nav
        aria-label="Navigation principale"
        data-onglets
        className="fixed inset-x-0 bottom-0 z-30 border-t border-trait bg-carte/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {RUBRIQUES.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onAller(r.id)}
                aria-current={actif === r.id ? 'page' : undefined}
                className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold ${
                  actif === r.id ? 'text-accent' : 'text-discret'
                }`}
              >
                {actif === r.id && <span aria-hidden="true" className="absolute top-0 h-[3px] w-8 rounded-full bg-accent" />}
                <Picto id={r.id} />
                {r.libelle}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
