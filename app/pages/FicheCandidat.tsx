import { Extraits } from '../ecrans/Extraits.tsx';
import { EXPLICATIONS_MOTIFS, libelleTheme, libelleValeur, MOTIFS_NON_EVALUATION, NATURES, pourcentage, SEUIL_EVALUE, THEMES } from '../libelles.ts';
import { questionsParId } from '../jeu.ts';
import { paquet } from '../paquet.ts';
import { Texte } from '../glossaire/Texte.tsx';

const STATUTS: Record<string, string> = {
  evalue: 'Évalué',
  codage_en_attente: 'Codage en attente',
  non_evalue: 'Non évalué',
};

export function FicheCandidat({ id, onRetour, libelleRetour = '← Retour' }: { id: string; onRetour: () => void; libelleRetour?: string }) {
  const c = paquet.candidats.find((x) => x.id === id);
  if (!c) return null;
  const positions = paquet.positions[id] ?? [];
  const publiees = positions.filter((p) => p.etat === 'publie');
  const enAttente = positions.filter((p) => p.etat === 'arbitrage_en_attente').length;
  const actives = paquet.questions.length;
  const parNature = (n: string) => publiees.filter((p) => p.nature === n).length;
  const q = (qid: string) => questionsParId.get(qid);

  return (
    <main className="conteneur flex max-w-4xl flex-col gap-4 py-8 leading-relaxed">
      <header>
        <button type="button" onClick={onRetour} className="lien">
          {libelleRetour}
        </button>
        <h1 className="titre-page mt-2">{c.prenom} {c.nom}</h1>
        <p className="mt-1 text-lg text-discret">{c.parti}</p>
      </header>

      <section className="carte p-5 text-sm">
        <h2 className="font-titre text-xl font-bold">Statut et couverture</h2>
        <ul className="mt-2 flex flex-col gap-1">
          <li>
            Statut :{' '}
            <strong>
              {c.statutEvaluation === 'codage_en_attente' && publiees.length > 0
                ? // Même règle que le calcul (jeu.ts) : un candidat avec des positions publiées est comparé, même si son
                  // statut dans les données est encore « codage en attente » (sous 40 % des questions actives codées).
                  'Comparé dans les résultats, codage en cours'
                : STATUTS[c.statutEvaluation]}
            </strong>
            {c.motifNonEvaluation ? ` (${MOTIFS_NON_EVALUATION[c.motifNonEvaluation] ?? c.motifNonEvaluation})` : ''}
          </li>
          <li className="text-discret">
            {c.statutEvaluation === 'non_evalue'
              ? EXPLICATIONS_MOTIFS[c.motifNonEvaluation ?? 'motif_non_renseigne']
              : c.statutEvaluation === 'evalue'
                ? EXPLICATIONS_MOTIFS.evalue
                : publiees.length > 0
                  ? EXPLICATIONS_MOTIFS.compare
                  : EXPLICATIONS_MOTIFS.codage_en_attente}
          </li>
          <li data-testid="couverture">
            Questions actives codées : <strong>{publiees.length}</strong> sur {actives}, soit <strong>{pourcentage(publiees.length / actives)}</strong>{' '}
            <span className="text-discret">(seuil du statut « évalué » : {pourcentage(SEUIL_EVALUE)})</span>
          </li>
          {publiees.length > 0 && (
            <li>
              Précision : {parNature('nette')} nettes, {parNature('nuancee')} nuancées, {parNature('imprecise')} imprécises, {parNature('non_connu')} non connues
            </li>
          )}
          {enAttente > 0 && <li>{enAttente} positions en attente d'arbitrage (traitées comme « non connu »).</li>}
          <li>Programme : pas de document de programme rattaché à la fiche pour l'instant.</li>
          <li>Indicateur de votes : pas encore disponible.</li>
        </ul>
      </section>

      {publiees.length === 0 ? (
        <p className="text-discret">Aucune position n'est encore publiée pour ce candidat.</p>
      ) : (
        Object.keys(THEMES).map((t) => {
          const liste = publiees.filter((p) => q(p.questionId)?.theme === t && p.code !== null);
          if (liste.length === 0) return null;
          return (
            <details key={t} className="depliant carte px-5 py-2">
              <summary className="font-titre text-xl font-bold">
                <span>
                {libelleTheme(t)} <span className="text-sm font-normal text-discret">· {liste.length} positions</span>
                </span>
              </summary>
              <ul className="mt-1 mb-3 flex flex-col gap-3 text-[0.95rem]">
                {liste.map((p) => (
                  <li key={p.questionId} className="rounded-xl border border-trait bg-fond p-4">
                    <p className="font-semibold">
                      <Texte>{q(p.questionId)?.enonce}</Texte>
                    </p>
                    <p className="mt-1">Position : <strong>{libelleValeur(p.code!)}</strong> ({NATURES[p.nature ?? ''] ?? p.nature})</p>
                    <Extraits extraits={p.extraits} className="mt-2" />
                  </li>
                ))}
              </ul>
            </details>
          );
        })
      )}
    </main>
  );
}
