import { LIEN_VERSIONS, dateLongue, libelleDonnees, lienNotes, versions } from '../versions.ts';
import type { VersionComposant } from '../../core/versions.ts';
import { Carte } from '../ui/Carte.tsx';

/** Ligne de pied de page : version des données (avec sa date) et de l'application, lien vers les notes de version. */
export function LigneVersions() {
  if (!versions) return null;
  return (
    <div className="flex flex-col gap-1" data-testid="versions">
      {versions.canal === 'preprod' && (
        <p className="w-fit rounded-md border border-accent/60 bg-carte px-2 py-1 text-accent">
          Préproduction : ce site contient des modifications pas encore publiées
          {versions.commit ? ` (commit ${versions.commit})` : ''}.
        </p>
      )}
      <p>
        {libelleDonnees(versions)} · application v{versions.application.version} ·{' '}
        <a className="lien-texte" href={LIEN_VERSIONS} rel="noopener noreferrer">
          Notes de version
        </a>
      </p>
    </div>
  );
}

const ligne = (nom: string, c: VersionComposant) => (
  <li>
    {nom} : <strong>v{c.version}</strong>
    {c.date ? (
      <>
        {' '}du {dateLongue(c.date)} ·{' '}
        <a className="lien-texte" href={lienNotes(c.tag)} rel="noopener noreferrer">
          ce qui a changé
        </a>
      </>
    ) : (
      ' (pas encore publiée)'
    )}
  </li>
);

/** Encadré de la page Méthode : versions en ligne et liens vers leurs notes de version. */
export function EncadreVersions() {
  if (!versions) return null;
  return (
    <Carte className="p-5 text-sm" data-testid="encadre-versions">
      <h2 className="titre-carte">Versions en ligne</h2>
      <ul className="mt-2 flex flex-col gap-1">
        {ligne('Données', versions.donnees)}
        {ligne('Application', versions.application)}
      </ul>
      <p className="mt-2 text-discret">
        Les données (candidats, questions, positions codées, méthode) et l'application ont chacune leur numéro de version.
        Un numéro qui change au dernier chiffre signale des corrections de codage ; au chiffre du milieu, des ajouts
        (candidats, questions) ; au premier, un changement de méthode qui rend les résultats non comparables avec les
        versions précédentes. Le détail de chaque modification reste dans le journal ci-dessous.{' '}
        <a className="lien-texte" href={LIEN_VERSIONS} rel="noopener noreferrer">
          Toutes les versions
        </a>
      </p>
      {versions.canal === 'preprod' && (
        <p className="mt-2 text-accent">Préproduction : modifications non publiées en plus de ces versions{versions.commit ? ` (commit ${versions.commit})` : ''}.</p>
      )}
    </Carte>
  );
}
