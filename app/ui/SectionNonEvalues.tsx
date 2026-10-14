import type { ReactNode } from 'react';

/**
 * Section « Non évalués » (candidats pressentis ou retirés) : repliée par défaut, le titre et le nombre de
 * candidats restent visibles dans le résumé. <details> natif : clavier, lecteurs d'écran et sans JavaScript.
 */
export function SectionNonEvalues({
  nombre,
  niveau: Titre = 'h2',
  classeTitre = 'titre-section',
  children,
}: {
  nombre: number;
  niveau?: 'h2' | 'h3';
  classeTitre?: string;
  children: ReactNode;
}) {
  return (
    <details className="depliant">
      <summary>
        <Titre className={classeTitre}>{`Non évalués (${nombre})`}</Titre>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
