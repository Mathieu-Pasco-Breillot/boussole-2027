import { useEffect, useState } from 'react';
import { EXPLICATIONS_MOTIFS, MOTIFS_NON_EVALUATION } from '../libelles.ts';
import { groupesCandidats, positionsPubliees } from '../listes.ts';
import type { CandidatPaquet } from '../paquet.ts';
import { paquet } from '../paquet.ts';
import { Markdown } from './Markdown.tsx';
import { chargerPages } from './donnees.ts';
import { Carte } from '../ui/Carte.tsx';
import { EntetePage } from '../ui/EntetePage.tsx';
import { PastilleCandidat } from '../ui/PastilleCandidat.tsx';

const actives = paquet.questions.length;

function Ligne({ c, detail, onFiche }: { c: CandidatPaquet; detail: string; onFiche: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onFiche(c.id)} className="carte carte-lien">
        <PastilleCandidat prenom={c.prenom} nom={c.nom} />
        <span>
          <span className="titre-carte block text-lg">
            {c.prenom} {c.nom}
          </span>
          <span className="block text-xs text-discret">
            {c.parti} · {detail}
          </span>
        </span>
      </button>
    </li>
  );
}

function Groupe({ titre, explication, children }: { titre: string; explication: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="titre-section">{titre}</h2>
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
    <main className="page gap-10">
      <EntetePage titre="Candidats" onRetour={onRetour}>
        <p>Ordre alphabétique dans chaque groupe.</p>
      </EntetePage>

      <Carte as="section" note className="p-5 text-sm leading-relaxed">
        <h2 className="titre-carte">Le critère d'inclusion</h2>
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
            <summary className="font-semibold text-accent">Lire le critère complet</summary>
            <div className="mt-2">
              <Markdown source={critere} />
            </div>
          </details>
        )}
      </Carte>

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
