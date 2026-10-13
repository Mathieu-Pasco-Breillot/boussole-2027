/** Glossaire des sigles dans le paquet de l'application (issue #7). */
import type { Glossaire } from '../../core/types.generated.ts';

/**
 * Entrées du glossaire telles que les lit l'application : ordre alphabétique français (une lettre accentuée au
 * rang de sa lettre de base, les chiffres avant les lettres), champs dans un ordre stable, `formes` seulement s'il y en a.
 */
export function paquetGlossaire(entrees: readonly Glossaire.EntreeGlossaire[]): Glossaire.EntreeGlossaire[] {
  return [...entrees]
    .sort((a, b) => a.sigle.localeCompare(b.sigle, 'fr'))
    .map((e) => ({
      sigle: e.sigle,
      developpe: e.developpe,
      explication: e.explication,
      ...(e.formes ? { formes: [...e.formes] } : {}),
    }));
}
