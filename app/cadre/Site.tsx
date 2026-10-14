import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LigneVersions } from '../ecrans/Versions.tsx';
import { EnTete, LienNav } from '../ui/EnTete.tsx';
import { IconeQuestion } from '../ui/Icones.tsx';
import { Logo } from '../ui/Marque.tsx';
import { APropos } from './APropos.tsx';

/**
 * Rubriques du site. « Le quiz » mène au choix du format, sur l'accueil ; « Le duel » au choix du candidat.
 */
export type Rubrique = 'accueil' | 'jouer' | 'duel' | 'candidats' | 'banque' | 'methode';

const DEPOT = 'https://github.com/Mathieu-Pasco-Breillot/choose-your-candidate-2027';

/** En-tête : les quatre rubriques de la maquette V0. */
const PRINCIPALES: readonly { id: Rubrique; libelle: string }[] = [
  { id: 'accueil', libelle: 'Accueil' },
  { id: 'jouer', libelle: 'Le quiz' },
  { id: 'duel', libelle: 'Le duel' },
  { id: 'methode', libelle: 'Notre méthode' },
];

/** Pied de page : les autres rubriques du site. */
const SECONDAIRES: readonly { id: Rubrique; libelle: string }[] = [
  { id: 'candidats', libelle: 'Candidats' },
  { id: 'banque', libelle: 'Questions' },
];

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
 * Cadre des pages du site (accueil, candidats, questions, méthode, vie privée) : en-tête (quatre rubriques et
 * « À propos ») et pied de page (autres rubriques, vie privée, versions). Les écrans de parcours (préparation, quiz,
 * résultats, duel, défi) n'ont pas ce cadre : rien ne détourne de la partie en cours.
 */
export function Site({ actif, onAller, onVieprivee, onToutEffacer, children }: Props) {
  const [aPropos, setAPropos] = useState(false);
  const declencheur = useRef<HTMLButtonElement>(null);
  const fermerAPropos = () => {
    setAPropos(false);
    declencheur.current?.focus();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <EnTete
        logo={
          <button type="button" onClick={() => onAller('accueil')} className="flex min-h-11 items-center" aria-label="Boussole : retour à l'accueil">
            <Logo />
          </button>
        }
        navigation={
          <nav aria-label="Navigation principale" className="entete-nav">
            <ul>
              {PRINCIPALES.map((r) => (
                <li key={r.id}>
                  <LienNav actif={actif === r.id} onClick={() => onAller(r.id)}>
                    {r.libelle}
                  </LienNav>
                </li>
              ))}
            </ul>
          </nav>
        }
        actions={
          <button ref={declencheur} type="button" aria-haspopup="dialog" onClick={() => setAPropos(true)} className="entete-a-propos">
            <IconeQuestion />
            À propos
          </button>
        }
      />
      {aPropos && <APropos onFermer={fermerAPropos} />}

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
          <nav aria-label="Autres rubriques" className="flex flex-col items-start gap-1 md:items-end">
            {SECONDAIRES.map((r) => (
              <button key={r.id} type="button" onClick={() => onAller(r.id)} aria-current={actif === r.id ? 'page' : undefined} className="lien">
                {r.libelle}
              </button>
            ))}
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
    </div>
  );
}
