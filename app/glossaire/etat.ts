/**
 * État du glossaire (issue #7) : fonctions pures, testées sans navigateur (etat.test.ts). Sans DOM : ce fichier est
 * aussi vérifié par tsconfig.node.json.
 */
export interface EtatGlossaire {
  /** Panneau (ordinateur) ou feuille (téléphone) affiché. */
  ouvert: boolean;
  /** Sigle mis en évidence ; null à l'ouverture par le bouton « Glossaire » ou sur un sigle inconnu. */
  entree: string | null;
  /** Compteur des ouvertures sur une entrée : relance le défilement même quand l'entrée ne change pas. */
  demande: number;
}

export type ActionGlossaire = { type: 'ouvrir'; sigle: string } | { type: 'fermer' } | { type: 'basculer' };

export const ETAT_INITIAL: EtatGlossaire = { ouvert: false, entree: null, demande: 0 };

/** `connus` : les sigles du glossaire. Un sigle inconnu ouvre le glossaire sans rien mettre en évidence. */
export function reduireGlossaire(connus: ReadonlySet<string>, etat: EtatGlossaire, action: ActionGlossaire): EtatGlossaire {
  switch (action.type) {
    case 'ouvrir':
      return connus.has(action.sigle)
        ? { ouvert: true, entree: action.sigle, demande: etat.demande + 1 }
        : { ouvert: true, entree: null, demande: etat.demande };
    case 'fermer':
      return etat.ouvert ? { ouvert: false, entree: null, demande: etat.demande } : etat;
    case 'basculer':
      return { ouvert: !etat.ouvert, entree: null, demande: etat.demande };
  }
}

/** Identifiant d'ancre de l'entrée d'un sigle dans la liste du glossaire. */
export const idAncre = (sigle: string): string => `glossaire-${sigle}`;

/** Défilement vers l'entrée demandée : instantané si l'utilisateur a demandé moins d'animations. */
export const comportementDefilement = (reduit: boolean): 'auto' | 'smooth' => (reduit ? 'auto' : 'smooth');
