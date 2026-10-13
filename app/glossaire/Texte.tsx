import { Fragment } from 'react';
import { segmenter, type Segment } from '../../core/glossaire/index.ts';
import { INDEX } from './donnees.ts';
import { Sigle } from './Sigle.tsx';

/**
 * Texte affiché dont les sigles du glossaire deviennent des <Sigle>. Un appel = un bloc de texte : le (i) ne marque
 * que la première occurrence de chaque sigle dans ce bloc. Ne pas utiliser dans un lien, un bouton, un <summary> ni
 * un <label> (pas de contrôle imbriqué).
 */
export function Texte({ children }: { children: string | null | undefined }) {
  if (!children) return null;
  return <Segments segments={segmenter(children, INDEX)} />;
}

/**
 * Découpe d'un texte en un bloc : pour un bloc rendu en plusieurs morceaux (Markdown : gras, italique, texte brut),
 * découper chaque morceau avec le même `vus` (segmenter, INDEX) et rendre le résultat ici.
 */
export function decouper(morceau: string, vus: Set<string>): Segment[] {
  return segmenter(morceau, INDEX, vus);
}

export function Segments({ segments }: { segments: readonly Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.type === 'texte' ? <Fragment key={i}>{s.texte}</Fragment> : <Sigle key={i} texte={s.texte} sigle={s.sigle} premiere={s.premiere} />,
      )}
    </>
  );
}
