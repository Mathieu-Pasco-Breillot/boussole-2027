import type { ReactNode } from 'react';

/** En-tête collant du site : emplacement pour la marque, la navigation et les actions. Le contenu vient de l'appelant. */
export function EnTete({ logo, navigation, actions }: { logo: ReactNode; navigation?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="entete">
      <div className="conteneur entete-interieur">
        {logo}
        {navigation}
        {actions}
      </div>
    </header>
  );
}

/** Lien de navigation de l'en-tête. L'élément actif est souligné et annoncé (aria-current). */
export function LienNav({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-current={actif ? 'page' : undefined} className="lien-nav">
      {children}
    </button>
  );
}
