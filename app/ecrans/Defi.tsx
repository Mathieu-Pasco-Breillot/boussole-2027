import { apresSource } from '../badges.ts';
import { majBadges } from '../stockage.ts';
import { useMemo, useState } from 'react';
import { nouveauDefi } from '../defi.ts';
import { libelleTheme } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { Mascotte } from './Mascotte.tsx';
import { Texte } from '../glossaire/Texte.tsx';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { EnteteParcours } from '../ui/EnteteParcours.tsx';
import { ProgressionParcours } from '../ui/ProgressionParcours.tsx';

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
      <main className="parcours gap-4">
        <EnteteParcours />
        <Mascotte attitude="attente" taille={88} className="mt-6" />
        <h1 className="titre-page">Qui a dit ça ?</h1>
        <p className="leading-relaxed">
          Le défi n'est pas disponible pour l'instant : trop peu de positions nettes et sourcées sont publiées pour proposer des
          manches équilibrées entre candidats.
        </p>
        <Bouton onClick={onQuitter} className="self-start">
          Retour
        </Bouton>
      </main>
    );
  }

  if (!manche) {
    return (
      <main className="parcours gap-5">
        <EnteteParcours />
        <header className="mt-6">
          <p className="surtitre surtitre-point">Qui a dit ça ?</p>
          <h1 className="titre-page mt-3" role="status">
            {bonnes} bonne{bonnes > 1 ? 's' : ''} réponse{bonnes > 1 ? 's' : ''} sur {total}
          </h1>
        </header>
        <p className="leading-relaxed text-discret">
          Ce jeu ne compare pas les candidats entre eux et n'a aucun lien avec votre résultat. Chaque position vient d'une source
          publique que vous pouvez ouvrir.
        </p>
        <div className="flex flex-col gap-3">
          <Bouton grand pleine fleche onClick={onRejouer}>
            Rejouer
          </Bouton>
          <Bouton variante="secondaire" pleine onClick={onQuitter}>
            Retour
          </Bouton>
        </div>
      </main>
    );
  }

  const repondu = choix[numero];
  const juste = repondu === manche.bonne_reponse;
  const position = repondu ? manche.revelation : manche.indice;

  return (
    <main className="parcours gap-5">
      <EnteteParcours>
        <Bouton variante="lien" onClick={onQuitter}>
          ← Quitter le défi
        </Bouton>
      </EnteteParcours>
      <ProgressionParcours etiquette="Qui a dit ça ? · manche" position={numero} total={total} avancement={repondu ? numero + 1 : numero} />

      <Carte as="section" note className="p-5 leading-relaxed" aria-labelledby="titre-position">
        <p className="text-sm text-discret">{themeDeQuestion(manche.question_id)}</p>
        <p className="titre-carte mt-1 text-[1.35rem]">
          <Texte>{manche.enonce}</Texte>
        </p>
        <h2 id="titre-position" className="surtitre mt-5">
          Un candidat a pris cette position :
        </h2>
        <p className="mt-2">
          <Texte>{position.reformulation}</Texte>
        </p>
        {position.citation && (
          <p className="mt-2 italic">
            « <Texte>{position.citation}</Texte> »
          </p>
        )}
      </Carte>

      {!repondu ? (
        <ul className="reponses" aria-label="Candidats proposés">
          {manche.propositions.map((id) => (
            <li key={id}>
              <button type="button" onClick={() => setChoix((c) => ({ ...c, [numero]: id }))} className="reponse">
                {nom(id)}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <section className="flex flex-col gap-3" aria-live="polite">
          <p className="titre-carte">
            {juste ? 'Bonne réponse : ' : `Ce n'était pas ${nom(repondu)}, c'était `}
            {nom(manche.bonne_reponse)}.
          </p>
          <p className="text-sm [overflow-wrap:anywhere]">
            Source :{' '}
            <a className="lien-texte" href={manche.revelation.source.url} target="_blank" rel="noopener noreferrer" onClick={() => majBadges((b) => apresSource(b, manche.revelation.source.url))}>
              {manche.revelation.source.titre}
            </a>
            {manche.revelation.source.date_publication ? ` (${manche.revelation.source.date_publication})` : ''}
          </p>
          <Bouton grand pleine fleche onClick={() => setNumero(numero + 1)}>
            {numero + 1 < total ? 'Manche suivante' : 'Voir le total'}
          </Bouton>
        </section>
      )}
    </main>
  );
}
