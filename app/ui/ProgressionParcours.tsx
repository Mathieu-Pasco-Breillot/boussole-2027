/**
 * Progression d'un parcours : étiquette, compteur « n / total » (annoncé poliment) et barre native (<progress>,
 * role progressbar implicite : pas de style en ligne, donc compatible avec la CSP).
 */
export function ProgressionParcours({ etiquette, position, total, avancement }: { etiquette: string; position: number; total: number; avancement: number }) {
  return (
    <div className="progression">
      <div className="progression-meta">
        <span className="surtitre">{etiquette}</span>
        <span aria-live="polite" className="progression-compteur">
          {position + 1} / {total}
        </span>
      </div>
      <progress className="barre mt-2.5" aria-label="Progression" max={total} value={avancement} />
    </div>
  );
}
