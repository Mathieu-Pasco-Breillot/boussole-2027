import { apresSource } from '../badges.ts';
import type { ExtraitPaquet } from '../paquet.ts';
import { majBadges } from '../stockage.ts';
import { Texte } from '../glossaire/Texte.tsx';

/**
 * Tous les extraits qui fondent une position, pas seulement le premier : un code se comprend souvent
 * par la combinaison des sources (ex. un candidat contre une mesure parce qu'il veut aller plus loin).
 */
export function Extraits({ extraits, className = 'mt-2' }: { extraits?: ExtraitPaquet[]; className?: string }) {
  if (!extraits || extraits.length === 0) return null;
  return (
    <div className={`${className} flex flex-col gap-3`} data-extraits>
      {extraits.map((e, i) => (
        <div key={`${e.source.url}-${i}`} className="border-l-2 border-accent/60 pl-3 [overflow-wrap:anywhere]">
          <p>
            <Texte>{e.reformulation}</Texte>
          </p>
          {e.citation && (
            <p className="mt-1 italic">
              « <Texte>{e.citation}</Texte> »
            </p>
          )}
          <p className="mt-1 text-sm">
            <a
              className="lien-texte"
              href={e.source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => majBadges((b) => apresSource(b, e.source.url))}
            >
              {e.source.titre}
            </a>
            {e.source.datePublication ? ` (${e.source.datePublication})` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}
