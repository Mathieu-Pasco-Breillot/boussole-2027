import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ENTREES } from './donnees.ts';
import { useGlossaire } from './GlossaireProvider.tsx';
import { useMedia } from './media.ts';

const PAR_DEFAUT = { dessous: false, droite: false };

/**
 * Un sigle du glossaire dans un texte : un seul bouton, souligné en pointillé. Clic ou tap : ouvre le glossaire sur
 * son entrée. Sur un appareil avec survol, une bulle (role="tooltip") s'affiche au survol et au focus (WCAG 1.4.13) :
 * survolable (elle est dans la zone survolée), persistante tant que le pointeur ou le focus reste, fermée par Échap.
 * Sans survol (tactile), pas de bulle ; le (i) de la première occurrence est dessiné en CSS (index.css).
 * La bulle s'ouvre au-dessus, alignée à gauche ; si elle sortirait de l'écran (titre en haut de page, sigle près du
 * bord droit), elle passe dessous ou s'aligne à droite (classes, pas de style en ligne : CSP).
 */
export function Sigle({ texte, sigle, premiere }: { texte: string; sigle: string; premiere: boolean }) {
  const { ouvrir } = useGlossaire();
  const survolable = useMedia('(hover: hover)');
  const [survol, setSurvol] = useState(false);
  const [focus, setFocus] = useState(false);
  // Échap masque la bulle jusqu'au prochain survol ou focus.
  const [masquee, setMasquee] = useState(false);
  const [placement, setPlacement] = useState(PAR_DEFAUT);
  const bulle = useRef<HTMLSpanElement>(null);
  const id = useId();
  const entree = ENTREES.get(sigle);
  const visible = survolable && (survol || focus) && !masquee && entree !== undefined;

  // Avant la peinture : on mesure la bulle à sa place par défaut, puis on la déplace si elle déborde (pas de saut visible).
  useLayoutEffect(() => {
    if (!visible) {
      setPlacement(PAR_DEFAUT);
      return;
    }
    const r = bulle.current?.getBoundingClientRect();
    if (r) setPlacement({ dessous: r.top < 0, droite: r.right > document.documentElement.clientWidth });
  }, [visible]);

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
        <span
          ref={bulle}
          role="tooltip"
          id={id}
          className={`bulle${placement.dessous ? ' bulle-dessous' : ''}${placement.droite ? ' bulle-droite' : ''}`}
        >
          <span className="bulle-contenu">
            <strong>{entree.sigle}</strong> — {entree.developpe}. {entree.explication}
          </span>
        </span>
      )}
    </span>
  );
}
