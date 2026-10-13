import { apresSource } from '../badges.ts';
import { majBadges } from '../stockage.ts';
import { useMemo, useState } from 'react';
import { nouveauDefi } from '../defi.ts';
import { libelleTheme } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { Mascotte } from './Mascotte.tsx';
import { Texte } from '../glossaire/Texte.tsx';

interface Props {
  graine: number;
  onRejouer: () => void;
  onQuitter: () => void;
}

const nom = (id: string): string => {
  const c = paquet.candidats.find((x) => x.id === id);
  return c ? `${c.prenom} ${c.nom}` : id;
};
const themeDeQuestion = (id: string): string => libelleTheme(paquet.questions.find((q) => q.id === id)?.theme ?? '');

export function Defi({ graine, onRejouer, onQuitter }: Props) {
  const defi = useMemo(() => nouveauDefi(graine), [graine]);
  const [numero, setNumero] = useState(0);
  const [choix, setChoix] = useState<Record<number, string>>({});
  const manche = defi.manches[numero];
  const total = defi.manches.length;
  const bonnes = defi.manches.filter((m, i) => choix[i] === m.bonne_reponse).length;

  if (total === 0) {
    return (
      <main className="colonne flex flex-col items-start gap-4 py-10">
        <Mascotte attitude="attente" taille={88} />
        <h1 className="titre-page">Qui a dit ça ?</h1>
        <p className="leading-relaxed">
          Le défi n'est pas disponible pour l'instant : trop peu de positions nettes et sourcées sont publiées pour proposer des
          manches équilibrées entre candidats.
        </p>
        <button type="button" onClick={onQuitter} className="btn btn-primaire">
          Retour
        </button>
      </main>
    );
  }

  if (!manche) {
    return (
      <main className="colonne flex flex-col gap-5 py-8">
        <p className="surtitre">Qui a dit ça ?</p>
        <h1 className="titre-page" role="status">
          {bonnes} bonne{bonnes > 1 ? 's' : ''} réponse{bonnes > 1 ? 's' : ''} sur {total}
        </h1>
        <p className="leading-relaxed text-discret">
          Ce jeu ne compare pas les candidats entre eux et n'a aucun lien avec votre résultat. Chaque position vient d'une source
          publique que vous pouvez ouvrir.
        </p>
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onRejouer} className="btn btn-primaire btn-grand">
            Rejouer
          </button>
          <button type="button" onClick={onQuitter} className="btn btn-secondaire">
            Retour
          </button>
        </div>
      </main>
    );
  }

  const repondu = choix[numero];
  const juste = repondu === manche.bonne_reponse;

  return (
    <main className="colonne flex flex-col gap-5 py-8">
      <header>
        <button type="button" onClick={onQuitter} className="lien">
          ← Quitter le défi
        </button>
        <p className="mt-2 surtitre">
          Qui a dit ça ? · manche {numero + 1} sur {total}
        </p>
      </header>

      <section className="carte border-l-4 border-l-accent p-5 leading-relaxed" aria-labelledby="titre-position">
        <p className="text-sm text-discret">{themeDeQuestion(manche.question_id)}</p>
        <p className="mt-1 font-titre text-xl leading-snug font-bold">
          <Texte>{manche.enonce}</Texte>
        </p>
        <h2 id="titre-position" className="surtitre mt-5">
          Un candidat a pris cette position :
        </h2>
        <p className="mt-2">
          <Texte>{repondu ? manche.revelation.reformulation : manche.indice.reformulation}</Texte>
        </p>
        {(repondu ? manche.revelation.citation : manche.indice.citation) && (
          <p className="mt-2 italic">
            « <Texte>{repondu ? manche.revelation.citation : manche.indice.citation}</Texte> »
          </p>
        )}
      </section>

      {!repondu ? (
        <ul className="flex flex-col gap-2" aria-label="Candidats proposés">
          {manche.propositions.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setChoix((c) => ({ ...c, [numero]: id }))}
                className="carte min-h-14 w-full px-5 py-3 text-left font-titre text-lg font-bold hover:border-accent"
              >
                {nom(id)}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <section className="flex flex-col gap-3" aria-live="polite">
          <p className="font-titre text-xl font-bold">
            {juste ? 'Bonne réponse : ' : `Ce n'était pas ${nom(repondu)}, c'était `}
            {nom(manche.bonne_reponse)}.
          </p>
          <p className="text-sm [overflow-wrap:anywhere]">
            Source :{' '}
            <a className="underline" href={manche.revelation.source.url} target="_blank" rel="noopener noreferrer" onClick={() => majBadges((b) => apresSource(b, manche.revelation.source.url))}>
              {manche.revelation.source.titre}
            </a>
            {manche.revelation.source.date_publication ? ` (${manche.revelation.source.date_publication})` : ''}
          </p>
          <button
            type="button"
            onClick={() => setNumero(numero + 1)}
            className="btn btn-primaire"
          >
            {numero + 1 < total ? 'Manche suivante' : 'Voir le total'}
          </button>
        </section>
      )}
    </main>
  );
}
