import { cx } from './cx.ts';

/** Marque : une boussole (le pictogramme du quiz) sur une pastille d'accent. Décorative : le nom accessible vient du lien ou du bouton autour. */
export function Marque({ petite = false }: { petite?: boolean }) {
  return (
    <span className={cx('marque', petite && 'marque-petite')} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <circle cx="12" cy="12" r="9" className="stroke-carte" strokeWidth="1.8" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" className="fill-soleil stroke-soleil" strokeWidth="1.4" />
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
