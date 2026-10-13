import { cx } from './cx.ts';

/** Marque : l'urne et son bulletin sur une pastille d'accent. Décorative : le nom accessible vient du lien ou du bouton autour. */
export function Marque({ petite = false }: { petite?: boolean }) {
  return (
    <span className={cx('marque', petite && 'marque-petite')} aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <rect x="11" y="2.5" width="10" height="8" rx="1.2" className="fill-papier stroke-soleil" strokeWidth="1.6" />
        <rect x="5" y="12" width="22" height="17" rx="4" className="fill-carte stroke-soleil" strokeWidth="2.2" />
        <rect x="3" y="9" width="26" height="5.5" rx="2.5" className="fill-soleil" />
        <rect x="11" y="10.8" width="10" height="1.9" rx="0.95" className="fill-accent-fonce" />
        <circle cx="12.5" cy="20" r="1.7" className="fill-encre" />
        <circle cx="19.5" cy="20" r="1.7" className="fill-encre" />
        <path d="M13 24.3q3 2 6 0" fill="none" className="stroke-encre" strokeWidth="1.5" strokeLinecap="round" />
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
        Mon Isoloir <span className="logo-annee">2027</span>
      </span>
    </span>
  );
}
