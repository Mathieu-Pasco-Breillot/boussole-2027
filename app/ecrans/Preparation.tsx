import { useState } from 'react';
import type { PoidsTheme } from '../../core/tirage/index.ts';
import { THEMES, MODES } from '../libelles.ts';
import type { ModeJeu, Preparation as PreparationChoisie } from '../jeu.ts';
import { paquet } from '../paquet.ts';
import { lireVues } from '../stockage.ts';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { EnteteParcours } from '../ui/EnteteParcours.tsx';
import { PastilleCandidat } from '../ui/PastilleCandidat.tsx';

interface Props {
  mode: ModeJeu;
  onLancer: (p: PreparationChoisie) => void;
  onRetour: () => void;
}

const candidatsParNom = [...paquet.candidats].sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr'));

export function Preparation({ mode, onLancer, onRetour }: Props) {
  const [affinites, setAffinites] = useState<string[]>([]);
  const [vues] = useState(() => new Set(lireVues().map((v) => v.id)));
  const disponibles = paquet.questions.length;
  const nonVues = paquet.questions.filter((q) => !vues.has(q.id)).length;
  const prevues = Math.min(MODES[mode].questions, disponibles);

  const basculer = (id: string) =>
    setAffinites((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <main className="parcours gap-7">
      <EnteteParcours>
        <button type="button" onClick={onRetour} className="lien">
          ← Retour
        </button>
      </EnteteParcours>
      <header>
        <p className="surtitre surtitre-point">
          Mode {MODES[mode].nom} · {MODES[mode].questions} questions
        </p>
        <h1 className="titre-page mt-3">Préparation</h1>
        <p className="mt-3 text-lg text-discret">Un seul réglage, facultatif. Vous pouvez lancer la partie tel quel.</p>
        <Carte as="p" note className="mt-4 p-4 text-sm leading-relaxed" role="status">
          <strong>{prevues} questions</strong> tirées au sort parmi {disponibles}
          {vues.size > 0 ? ` (dont ${nonVues} jamais vues sur cet appareil)` : ''}, tous thèmes confondus. Les candidats ne sont pas
          nommés pendant le quiz.
        </Carte>
      </header>

      <section aria-labelledby="titre-affinites">
        <h2 id="titre-affinites" className="font-titre text-2xl font-normal tracking-tight text-marine">
          Vos affinités (facultatif)
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-discret">
          Cochez les candidats dont vous vous sentez proche. <strong>Les affinités n'entrent pas dans le score</strong> et
          n'influencent pas le choix des questions : elles servent seulement, à la fin, à situer ces candidats dans vos résultats.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {candidatsParNom.map((c) => (
            <li key={c.id}>
              <label className="option-candidat">
                <PastilleCandidat prenom={c.prenom} nom={c.nom} />
                <span className="min-w-0 flex-1">
                  {c.prenom} {c.nom}
                  <span className="block text-xs text-discret">{c.parti}</span>
                </span>
                <input type="checkbox" className="size-5 shrink-0 accent-accent" checked={affinites.includes(c.id)} onChange={() => basculer(c.id)} />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div data-barre-action className="barre-action mt-auto">
        {/* Tous les thèmes au même poids : pas de choix de thèmes, qui pourrait fausser le rapprochement (les candidats
            ne sont pas codés sur le même nombre de questions dans chaque thème). */}
        <Bouton
          grand
          pleine
          fleche
          onClick={() => onLancer({ poids: Object.fromEntries(Object.keys(THEMES).map((t) => [t, 1 as PoidsTheme])), affinites })}
        >
          Lancer la partie ({prevues} questions)
        </Bouton>
      </div>
    </main>
  );
}
