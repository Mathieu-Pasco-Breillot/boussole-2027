import { useEffect, useState } from 'react';
import { SEUIL_CLASSEMENT_QUESTIONS } from '../../core/score/parametres.ts';
import { MODES } from '../libelles.ts';
import { paquet } from '../paquet.ts';
import { EncadreVersions } from '../ecrans/Versions.tsx';
import { Markdown } from './Markdown.tsx';
import { chargerPages } from './donnees.ts';
import type { Pages } from './donnees.ts';
import { Texte } from '../glossaire/Texte.tsx';

interface Props {
  onRetour: () => void;
  /** Journal de tirage et graine de la partie en cours ou terminée, s'il y en a une. */
  graine: number | null;
  journal: readonly string[] | null;
}

type Onglet = 'principe' | 'methodologie' | 'grille' | 'critere' | 'journal' | 'neutralite';
const ONGLETS: readonly { id: Onglet; libelle: string }[] = [
  { id: 'principe', libelle: 'En bref' },
  { id: 'methodologie', libelle: 'Méthodologie' },
  { id: 'grille', libelle: 'Grille de codage' },
  { id: 'critere', libelle: "Critère d'inclusion" },
  { id: 'journal', libelle: 'Journal des modifications' },
  { id: 'neutralite', libelle: 'Rapport de neutralité' },
];

const nom = (id: string): string => {
  const c = paquet.candidats.find((x) => x.id === id);
  return c ? `${c.prenom} ${c.nom}` : id;
};
const pct = (x: number): string => `${Math.round(x * 100)} %`;

export function Methode({ onRetour, graine, journal }: Props) {
  const [pages, setPages] = useState<Pages | null>(null);
  const [onglet, setOnglet] = useState<Onglet>('principe');
  useEffect(() => {
    void chargerPages().then(setPages);
  }, []);

  return (
    <main className="conteneur flex max-w-4xl flex-col gap-6 py-8">
      <header>
        <button type="button" onClick={onRetour} className="lien">
          ← Retour
        </button>
        <h1 className="titre-page mt-2">Méthode</h1>
        <p className="mt-2 text-discret">Tout est public : textes, données et code sont dans le dépôt du projet.</p>
      </header>

      <div role="tablist" aria-label="Pages de méthode" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={onglet === o.id}
            onClick={() => setOnglet(o.id)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${onglet === o.id ? 'border-accent bg-accent text-fond' : 'border-trait bg-carte text-discret'}`}
          >
            {o.libelle}
          </button>
        ))}
      </div>

      <section role="tabpanel" className="text-[1.0625rem] leading-relaxed">
        {onglet === 'principe' && (
          <div className="flex flex-col gap-4">
            <p>
              Vous répondez à des propositions, de « tout à fait d'accord » à « pas du tout d'accord », avec la possibilité de
              marquer une question « très important » ou « sans avis ». Chaque réponse est comparée à la position publique de
              chaque candidat sur cette question, codée de −2 à +2 à partir d'une source que vous pouvez ouvrir.
            </p>
            <p>
              Un candidat n'est classé que s'il est codé sur au moins {SEUIL_CLASSEMENT_QUESTIONS} de vos questions ; sinon il
              apparaît « hors classement », avec le motif. Un candidat peu codé reste classé, mais son score est ramené vers 50 et
              sa fiabilité est indiquée. Le score est un rapprochement avec des positions publiques,
              pas une consigne de vote. Les votes au Parlement n'y entrent pas.
            </p>
            <p>
              Les modes : {Object.values(MODES).map((m) => `${m.nom} (${m.questions} questions)`).join(', ')}. Les questions
              sont tirées thème par thème selon vos poids, avec des questions « d'ancrage » choisies pour distinguer les
              candidats, et en évitant celles que vous avez déjà vues.
            </p>
            <div className="carte p-5">
              <h2 className="font-titre text-xl font-bold">Votre partie</h2>
              {graine === null ? (
                <p className="mt-1 text-sm text-discret">Aucune partie sur cet appareil. La graine du tirage s'affiche ici dès qu'une partie est lancée.</p>
              ) : (
                <>
                  <p className="mt-1 text-sm">
                    Graine du tirage : <strong>{graine}</strong>. Même graine et mêmes réponses redonnent les mêmes résultats.
                  </p>
                  {journal && (
                    <details className="mt-2 text-sm">
                      <summary className="min-h-11 cursor-pointer underline">Comment ces questions ont été tirées</summary>
                      <ul className="mt-2 flex flex-col gap-1 text-discret">
                        {journal.map((l, i) => <li key={i}>{l}</li>)}
                      </ul>
                    </details>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {onglet !== 'principe' && !pages && <p className="text-discret" role="status">Chargement…</p>}
        {pages && onglet === 'methodologie' && <Markdown source={pages.docs.methodologie} />}
        {pages && onglet === 'grille' && <Markdown source={pages.docs.grille} />}
        {pages && onglet === 'critere' && <Markdown source={pages.docs.critere} />}
        {onglet === 'journal' && <EncadreVersions />}
        {pages && onglet === 'journal' && (
          <ol className="mt-4 flex flex-col gap-3">
            {[...pages.journal].reverse().map((e, i) => (
              <li key={i} className="carte p-4 text-sm">
                <p className="font-semibold">{e.date} · {e.type.replace(/_/g, ' ')}</p>
                <p className="mt-1">
                  <Texte>{e.description}</Texte>
                </p>
                <p className="mt-1 text-discret">{e.objets.join(', ')}</p>
              </li>
            ))}
          </ol>
        )}
        {pages && onglet === 'neutralite' && (
          <div className="flex flex-col gap-4">
            {pages.neutralite.provisoire && (
              <p className="rounded-xl border-l-4 border-accent bg-carte p-3">
                <strong>Rapport provisoire.</strong> Il est calculé sur des codages encore partiels et en attente de validation humaine : à lire comme un contrôle de méthode, pas comme un résultat.
              </p>
            )}
            <p>
              Pour chaque mode, {pages.neutralite.parametres.tirages_par_mode.toLocaleString('fr-FR')} parties simulées (poids de thèmes
              aléatoires, toutes questions répondues) mesurent la part des parties où chaque candidat atteint le seuil de classement
              ({pages.neutralite.parametres.seuil_questions_codees} questions codées). Un écart important entre
              candidats signale un déséquilibre de couverture, pas une préférence.
            </p>
            {Object.entries(pages.neutralite.modes).map(([mode, m]) => (
              <div key={mode} className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="pb-1 text-left font-semibold">
                    Mode {MODES[mode as keyof typeof MODES]?.nom ?? mode} · {m.N} questions · écart maximal entre candidats : {pct(m.ecart_parts_atteint_seuils)}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="border-b border-accent/40 px-2 py-1">Candidat</th>
                      <th scope="col" className="border-b border-accent/40 px-2 py-1">Classé dans</th>
                      <th scope="col" className="border-b border-accent/40 px-2 py-1">Questions codées (moy.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(m.candidats).map(([id, c]) => (
                      <tr key={id}>
                        <th scope="row" className="border-b border-trait px-2 py-1 font-normal">{nom(id)}</th>
                        <td className="border-b border-trait px-2 py-1">{pct(c.part_atteint_seuils)} des parties</td>
                        <td className="border-b border-trait px-2 py-1">{c.questions_codees_moyenne.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
