import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { ENTREES } from './donnees.ts';
import { ETAT_INITIAL, reduireGlossaire, type ActionGlossaire, type EtatGlossaire } from './etat.ts';

export interface ValeurGlossaire {
  etat: EtatGlossaire;
  /** Ouvre le glossaire sur un sigle ; `declencheur` reprend le focus à la fermeture. */
  ouvrir: (sigle: string, declencheur: HTMLElement | null) => void;
  fermer: () => void;
  /** Ouvre (sans entrée) ou ferme le glossaire : bouton « Glossaire ». */
  basculer: (declencheur: HTMLElement | null) => void;
}

const Contexte = createContext<ValeurGlossaire | null>(null);
const SIGLES: ReadonlySet<string> = new Set(ENTREES.keys());
const reducteur = (etat: EtatGlossaire, action: ActionGlossaire): EtatGlossaire => reduireGlossaire(SIGLES, etat, action);

/** État du glossaire pour toute l'application (branché dans App.tsx). */
export function GlossaireProvider({ children }: { children: ReactNode }) {
  const [etat, envoyer] = useReducer(reducteur, ETAT_INITIAL);
  // Élément qui a ouvert le glossaire : il reprend le focus à la fermeture (feuille modale surtout).
  const declencheur = useRef<HTMLElement | null>(null);
  const ouvert = useRef(etat.ouvert);
  useEffect(() => {
    if (ouvert.current && !etat.ouvert) {
      const element = declencheur.current;
      declencheur.current = null;
      if (element?.isConnected) element.focus();
    }
    ouvert.current = etat.ouvert;
  }, [etat.ouvert]);

  const memoriser = useCallback((element: HTMLElement | null) => {
    if (!ouvert.current) declencheur.current = element;
  }, []);
  const ouvrir = useCallback(
    (sigle: string, element: HTMLElement | null) => {
      memoriser(element);
      envoyer({ type: 'ouvrir', sigle });
    },
    [memoriser],
  );
  const fermer = useCallback(() => envoyer({ type: 'fermer' }), []);
  const basculer = useCallback(
    (element: HTMLElement | null) => {
      memoriser(element);
      envoyer({ type: 'basculer' });
    },
    [memoriser],
  );

  const valeur = useMemo(() => ({ etat, ouvrir, fermer, basculer }), [etat, ouvrir, fermer, basculer]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useGlossaire(): ValeurGlossaire {
  const valeur = useContext(Contexte);
  if (!valeur) throw new Error('useGlossaire doit être appelé sous GlossaireProvider');
  return valeur;
}
