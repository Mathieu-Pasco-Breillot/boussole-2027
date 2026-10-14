import { cx } from './cx.ts';

/** Marque : une boussole sur une pastille d'accent. Décorative : le nom accessible vient du lien ou du bouton autour. */
export function Marque({ petite = false }: { petite?: boolean }) {
  return (
    <span className={cx('marque', petite && 'marque-petite')} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9.5" className="stroke-carte" />
        <path d="m15.8 8.2-1.9 5.7-5.7 1.9 1.9-5.7z" className="stroke-carte" />
      </svg>
    </span>
  );
}

/** Marque et nom du site. `petit` pour le pied de page. */
export function Logo({ petit = false }: { petit?: boolean }) {
  return (
    <span className={cx('logo', petit && 'logo-petit')}>
      <Marque petite={petit} />
      <span>
        Boussole <span className="logo-annee">2027</span>
      </span>
    </span>
  );
}
