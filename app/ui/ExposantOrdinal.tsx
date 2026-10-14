/**
 * Affiche un libellé avec le suffixe ordinal en exposant (« 1<sup>er</sup> tour », « 2<sup>nd</sup> tour »), comme
 * la typographie française. Le texte reste identique : seul le suffixe, collé à un chiffre, change de balise.
 */
export function ExposantOrdinal({ texte }: { texte: string }) {
  // Découpage avec groupe capturant : les segments impairs sont les suffixes « er » ou « nd ».
  const morceaux = texte.split(/(?<=\d)(er|nd)\b/);
  return (
    <>
      {morceaux.map((morceau, i) => (i % 2 === 1 ? <sup key={i}>{morceau}</sup> : morceau))}
    </>
  );
}
