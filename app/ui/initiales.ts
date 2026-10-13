/** Initiales d'une personne : première lettre du prénom et du nom, en majuscules (« Jean-Luc » et « Le Pen » donnent « JL »). */
export function initiales(prenom: string, nom: string): string {
  const premiere = (texte: string): string => [...texte.trim()][0]?.toLocaleUpperCase('fr') ?? '';
  return premiere(prenom) + premiere(nom);
}
