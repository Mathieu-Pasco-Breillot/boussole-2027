import { useEffect, useId, useState } from 'react';
import { ENTREES } from './donnees.ts';
import { useGlossaire } from './GlossaireProvider.tsx';
import { useMedia } from './media.ts';

/**
 * Un sigle du glossaire dans un texte : un seul bouton, souligné en pointillé. Clic ou tap : ouvre le glossaire sur
 * son entrée. Sur un appareil avec survol, une bulle (role="tooltip") s'affiche au survol et au focus (WCAG 1.4.13) :
 * survolable (elle est dans la zone survolée), persistante tant que le pointeur ou le focus reste, fermée par Échap.
 * Sans survol (tactile), pas de bulle ; le (i) de la première occurrence est dessiné en CSS (index.css).
 */
export function Sigle({ texte, sigle, premiere }: { texte: string; sigle: string; premiere: boolean }) {
  const { ouvrir } = useGlossaire();
  const survolable = useMedia('(hover: hover)');
  const [survol, setSurvol] = useState(false);
  const [focus, setFocus] = useState(false);
  // Échap masque la bulle jusqu'au prochain survol ou focus.
  const [masquee, setMasquee] = useState(false);
  const id = useId();
  const entree = ENTREES.get(sigle);
  const visible = survolable && (survol || focus) && !masquee && entree !== undefined;

  useEffect(() => {
    if (!visible) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMasquee(true);
    };
    document.addEventListener('keydown', touche);
    return () => document.removeEventListener('keydown', touche);
  }, [visible]);

  return (
    <span
      className="sigle"
      onMouseEnter={() => {
        setSurvol(true);
        setMasquee(false);
      }}
      onMouseLeave={() => setSurvol(false)}
    >
      <button
        type="button"
        className="sigle-bouton"
        data-sigle={sigle}
        data-premiere={premiere ? '' : undefined}
        aria-describedby={visible ? id : undefined}
        onFocus={() => {
          setFocus(true);
          setMasquee(false);
        }}
        onBlur={() => setFocus(false)}
        onClick={(e) => ouvrir(sigle, e.currentTarget)}
      >
        {texte}
      </button>
      {visible && (
        <span role="tooltip" id={id} className="bulle">
          <span className="bulle-contenu">
            <strong>{entree.sigle}</strong> — {entree.developpe}. {entree.explication}
          </span>
        </span>
      )}
    </span>
  );
}
