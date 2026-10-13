import { useState } from 'react';
import type { PoidsTheme } from '../../core/tirage/index.ts';
import { THEMES, MODES } from '../libelles.ts';
import type { ModeJeu, Preparation as PreparationChoisie } from '../jeu.ts';
import { paquet } from '../paquet.ts';
import { lireVues } from '../stockage.ts';

const stock: Record<string, number> = {};
for (const q of paquet.questions) stock[q.theme] = (stock[q.theme] ?? 0) + 1;

interface Props {
  mode: ModeJeu;
  onLancer: (p: PreparationChoisie) => void;
  onRetour: () => void;
}

const NIVEAUX: readonly { poids: PoidsTheme; libelle: string }[] = [
  { poids: 0, libelle: 'Écarter' },
  { poids: 1, libelle: 'Normal' },
  { poids: 2, libelle: 'Important' },
  { poids: 3, libelle: 'Prioritaire' },
];

const candidatsParNom = [...paquet.candidats].sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr'));

export function Preparation({ mode, onLancer, onRetour }: Props) {
  const themes = Object.keys(THEMES);
  const [poids, setPoids] = useState<Record<string, PoidsTheme>>(() => Object.fromEntries(themes.map((t) => [t, 1 as PoidsTheme])));
  const [affinites, setAffinites] = useState<string[]>([]);
  const actifs = themes.filter((t) => poids[t] !== 0);
  // Questions disponibles selon les poids (spécification § 6, ligne « Mode ») : un chapitre écarté retire ses questions.
  const [vues] = useState(() => new Set(lireVues().map((v) => v.id)));
  const disponibles = actifs.reduce((n, t) => n + (stock[t] ?? 0), 0);
  const nonVues = paquet.questions.filter((q) => actifs.includes(q.theme) && !vues.has(q.id)).length;
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
        <p className="mt-3 text-lg text-discret">Deux réglages facultatifs. Vous pouvez lancer la partie tel quel.</p>
        <p className="carte mt-4 border-l-4 border-l-accent p-4 text-sm leading-relaxed" role="status" data-questions-disponibles={disponibles}>
          Avec ces réglages : <strong>{disponibles} questions disponibles</strong>
          {vues.size > 0 ? ` (dont ${nonVues} jamais vues sur cet appareil)` : ''}.{' '}
          {prevues < MODES[mode].questions
            ? `La partie comptera ${prevues} questions au lieu de ${MODES[mode].questions} : gardez plus de chapitres pour en avoir davantage.`
            : `La partie comptera ${prevues} questions.`}
        </p>
      </header>

      <section aria-labelledby="titre-poids">
        <h2 id="titre-poids" className="font-titre text-2xl font-bold tracking-tight">
          Ce qui compte pour vous
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-discret">
          Un chapitre « important » reçoit plus de questions et pèse plus dans le score ; « écarter » le retire de la partie
          et du calcul. Les candidats ne sont pas nommés pendant le quiz.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {themes.map((t) => (
            <li key={t} className="carte p-4">
              <fieldset>
                <legend className="font-titre text-lg font-bold">{THEMES[t]}</legend>
                <div className="mt-2 grid grid-cols-4 gap-1" role="radiogroup" aria-label={`Importance du chapitre ${THEMES[t]}`}>
                  {NIVEAUX.map((n) => (
                    <label key={n.poids} className="segment">
                      <input
                        type="radio"
                        className="sr-only"
                        name={`poids-${t}`}
                        checked={poids[t] === n.poids}
                        onChange={() => setPoids((p) => ({ ...p, [t]: n.poids }))}
                      />
                      {n.libelle}
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ul>
      </section>

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
        <button
          type="button"
          disabled={actifs.length === 0}
          onClick={() => onLancer({ poids: Object.fromEntries(themes.map((t) => [t, poids[t]!])), affinites })}
          className="btn btn-primaire btn-grand w-full"
        >
          Lancer la partie{actifs.length > 0 ? ` (${prevues} questions)` : ''}
        </button>
        {actifs.length === 0 && <p className="mt-2 text-sm text-discret">Gardez au moins un chapitre pour lancer la partie.</p>}
      </div>
    </main>
  );
}
