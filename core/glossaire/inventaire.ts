/**
 * Mots en capitales d'un texte (issue #7) : au moins deux majuscules, chiffres admis, mot entier. Sert à
 * l'inventaire des sigles (scripts/inventaire-glossaire.ts) et au test d'exhaustivité (app/glossaire.test.ts).
 */
const MOT_EN_CAPITALES = /(?<![\p{L}\p{N}])\p{Lu}[\p{Lu}\p{N}]+(?![\p{L}\p{N}])/gu;

export function extraireSigles(texte: string): string[] {
  return [...texte.matchAll(MOT_EN_CAPITALES)].map((m) => m[0]).filter((mot) => (mot.match(/\p{Lu}/gu) ?? []).length >= 2);
}
