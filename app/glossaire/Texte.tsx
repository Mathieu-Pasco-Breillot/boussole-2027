import { Fragment } from 'react';
import { segmenter } from '../../core/glossaire/index.ts';
import { INDEX } from './donnees.ts';
import { Sigle } from './Sigle.tsx';

/**
 * Texte affiché dont les sigles du glossaire deviennent des <Sigle>. Un appel = un bloc de texte : le (i) ne marque
 * que la première occurrence de chaque sigle dans ce bloc. Ne pas utiliser dans un lien, un bouton, un <summary> ni
 * un <label> (pas de contrôle imbriqué).
 */
export function Texte({ children }: { children: string | null | undefined }) {
  if (!children) return null;
  return (
    <>
      {segmenter(children, INDEX).map((s, i) =>
        s.type === 'texte' ? <Fragment key={i}>{s.texte}</Fragment> : <Sigle key={i} texte={s.texte} sigle={s.sigle} premiere={s.premiere} />,
      )}
    </>
  );
}
