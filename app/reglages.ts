/**
 * Réglages de l'appareil : le son. Stocké en local, comme le reste ; lecture et écriture protégées (le site
 * fonctionne sans stockage, avec la valeur par défaut : son coupé). Le site n'a qu'un thème, clair : pas de réglage d'apparence.
 */

import { CLE_SON } from './stockage.ts';

function lire(cle: string): string | null {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
}

function ecrire(cle: string, valeur: string | null): void {
  try {
    if (valeur === null) localStorage.removeItem(cle);
    else localStorage.setItem(cle, valeur);
  } catch {
    /* stockage indisponible : le réglage vaut pour la visite en cours */
  }
}

/** Son : coupé par défaut (spécification J9). */
export const lireSon = (): boolean => lire(CLE_SON) === 'oui';
export const ecrireSon = (actif: boolean): void => ecrire(CLE_SON, actif ? 'oui' : null);
