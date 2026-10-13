import { useState } from 'react';
import type { PoidsTheme } from '../../core/tirage/index.ts';
import { THEMES, MODES } from '../libelles.ts';
import type { ModeJeu, Preparation as PreparationChoisie } from '../jeu.ts';
import { paquet } from '../paquet.ts';
import { lireVues } from '../stockage.ts';

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
    <main className="colonne flex max-w-3xl flex-col gap-8 pt-6">
      <header>
        <button type="button" onClick={onRetour} className="lien">
          ← Retour
        </button>
        <p className="surtitre mt-2">
          Mode {MODES[mode].nom} · {MODES[mode].questions} questions
        </p>
        <h1 className="titre-page mt-2">Préparation</h1>
        <p className="mt-3 text-lg text-discret">Un seul réglage, facultatif. Vous pouvez lancer la partie tel quel.</p>
        <p className="carte mt-4 border-l-4 border-l-accent p-4 text-sm leading-relaxed" role="status">
          <strong>{prevues} questions</strong> tirées au sort parmi {disponibles}
          {vues.size > 0 ? ` (dont ${nonVues} jamais vues sur cet appareil)` : ''}, tous thèmes confondus. Les candidats ne sont pas
          nommés pendant le quiz.
        </p>
      </header>

      <section aria-labelledby="titre-affinites">
        <h2 id="titre-affinites" className="font-titre text-2xl font-bold tracking-tight">
          Vos affinités (facultatif)
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-discret">
          Cochez les candidats dont vous vous sentez proche. <strong>Les affinités n'entrent pas dans le score</strong> et
          n'influencent pas le choix des questions : elles servent seulement, à la fin, à situer ces candidats dans vos résultats.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {candidatsParNom.map((c) => (
            <li key={c.id}>
              <label className="carte flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-4 py-2 shadow-none has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent">
                <input type="checkbox" className="size-5 accent-accent" checked={affinites.includes(c.id)} onChange={() => basculer(c.id)} />
                <span>
                  {c.prenom} {c.nom}
                  <span className="block text-xs text-discret">{c.parti}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div data-barre-action className="barre-action">
        {/* Tous les thèmes au même poids : pas de choix de thèmes, qui pourrait fausser le rapprochement (les candidats
            ne sont pas codés sur le même nombre de questions dans chaque thème). */}
        <button
          type="button"
          onClick={() => onLancer({ poids: Object.fromEntries(Object.keys(THEMES).map((t) => [t, 1 as PoidsTheme])), affinites })}
          className="btn btn-primaire btn-grand w-full"
        >
          Lancer la partie ({prevues} questions)
        </button>
      </div>
    </main>
  );
}
