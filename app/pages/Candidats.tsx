import { useEffect, useState } from 'react';
import { EXPLICATIONS_MOTIFS, MOTIFS_NON_EVALUATION } from '../libelles.ts';
import { groupesCandidats, positionsPubliees } from '../listes.ts';
import type { CandidatPaquet } from '../paquet.ts';
import { paquet } from '../paquet.ts';
import { Markdown } from './Markdown.tsx';
import { chargerPages } from './donnees.ts';

const actives = paquet.questions.length;

function Ligne({ c, detail, onFiche }: { c: CandidatPaquet; detail: string; onFiche: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onFiche(c.id)} className="carte flex min-h-16 w-full flex-col justify-center px-4 py-2.5 text-left hover:border-accent">
        <span className="font-titre text-lg font-bold">
          {c.prenom} {c.nom}
        </span>
        <span className="block text-xs text-discret">
          {c.parti} · {detail}
        </span>
      </button>
    </li>
  );
}

function Groupe({ titre, explication, children }: { titre: string; explication: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-titre text-2xl font-bold tracking-tight">{titre}</h2>
      <p className="mt-1 text-sm leading-relaxed text-discret">{explication}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">{children}</ul>
    </section>
  );
}

export function Candidats({ onRetour, onFiche }: { onRetour: () => void; onFiche: (id: string) => void }) {
  const g = groupesCandidats();
  const [critere, setCritere] = useState<string | null>(null);
  useEffect(() => {
    void chargerPages().then((p) => setCritere(p.docs.critere));
  }, []);

  return (
    <main className="conteneur flex max-w-4xl flex-col gap-10 py-8">
      <header>
        <button type="button" onClick={onRetour} className="lien">
          ← Retour
        </button>
        <h1 className="titre-page mt-2">Candidats</h1>
        <p className="mt-2 text-discret">Ordre alphabétique dans chaque groupe.</p>
      </header>

      <section className="carte border-l-4 border-l-accent p-5 text-sm leading-relaxed">
        <h2 className="font-titre text-xl font-bold">Le critère d'inclusion</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
          <li>Aucun seuil de sondages : personne n'est écarté sur son poids électoral.</li>
          <li>
            <strong>R1</strong> : candidature déclarée publiquement, personnellement et sans condition (ou investiture), attestée par un
            média national.
          </li>
          <li>
            <strong>R2</strong> : les participants à une primaire non achevée attendent sa fin ; le vainqueur est évalué.
          </li>
          <li>
            <strong>R3</strong> : à la publication de la liste officielle (mars 2027), seuls les candidats officiels restent évalués.
          </li>
        </ul>
        {critere && (
          <details className="depliant mt-3">
            <summary className="font-semibold">Lire le critère complet</summary>
            <div className="mt-2">
              <Markdown source={critere} />
            </div>
          </details>
        )}
      </section>

      <Groupe titre={`Comparés (${g.compares.length})`} explication={EXPLICATIONS_MOTIFS.compares!}>
        {g.compares.map((c) => (
          <Ligne key={c.id} c={c} onFiche={onFiche} detail={`${positionsPubliees(c.id)} positions codées sur ${actives} questions`} />
        ))}
      </Groupe>

      {g.enAttente.length > 0 && (
        <Groupe titre={`Codage en attente (${g.enAttente.length})`} explication={EXPLICATIONS_MOTIFS.codage_en_attente!}>
          {g.enAttente.map((c) => (
            <Ligne key={c.id} c={c} onFiche={onFiche} detail="codage en attente" />
          ))}
        </Groupe>
      )}

      {g.nonEvalues.map(([motif, liste]) => (
        <Groupe
          key={motif}
          titre={`Non évalués : ${(MOTIFS_NON_EVALUATION[motif] ?? motif).toLowerCase()} (${liste.length})`}
          explication={EXPLICATIONS_MOTIFS[motif] ?? motif}
        >
          {liste.map((c) => (
            <Ligne key={c.id} c={c} onFiche={onFiche} detail={MOTIFS_NON_EVALUATION[motif] ?? motif} />
          ))}
        </Groupe>
      ))}
    </main>
  );
}
