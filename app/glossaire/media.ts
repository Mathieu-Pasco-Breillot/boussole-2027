import { useCallback, useSyncExternalStore } from 'react';

/** Vrai tant que la requête média est satisfaite ; se met à jour quand elle change (rotation, redimensionnement). */
export function useMedia(requete: string): boolean {
  const abonner = useCallback(
    (rappel: () => void) => {
      const liste = window.matchMedia(requete);
      liste.addEventListener('change', rappel);
      return () => liste.removeEventListener('change', rappel);
    },
    [requete],
  );
  return useSyncExternalStore(abonner, () => window.matchMedia(requete).matches, () => false);
}
