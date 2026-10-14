import { dateLongue } from './versions.ts';

/**
 * Calendrier de la présidentielle 2027. Logique pure : aucune horloge globale, l'instant « maintenant » est toujours
 * passé en argument. Les dates vivent ici, dans le code de l'application, pas dans les données codées.
 *
 * Sources :
 * - https://www.service-public.gouv.fr/particuliers/actualites/A15053?lang=fr
 * - https://lcp.fr/actualites/presidentielle-2027-les-dates-du-premier-et-du-second-tour-fixees-438582
 * - https://www.touteleurope.eu/vie-politique-des-etats-membres/presidentielle-2027-calendrier-dates-inscription-candidats-vote/
 * - https://www.france-vote.fr/calendrier
 * - https://www.weka.fr/actualite/elus/article_juridique/parrainages-des-candidats-a-l-election-presidentielle-2027-quel-role-pour-les-elus-216318/
 *
 * Dates de parrainage à reconfirmer à la publication du décret de convocation (au plus tard le 7 février 2027).
 */

/** « officiel » : date fixée par un texte ou une annonce officielle ; « calculé » : déduit de la loi, à confirmer. */
export type StatutDate = 'officiel' | 'calculé';

/** Une date clé affichée dans le bandeau. `cible` n'existe que pour les tours, qui ont un décompte. */
export interface Jalon {
  id: string;
  titre: string;
  /** Quand, en toutes lettres (fuseau Europe/Paris). */
  quand: string;
  statut: StatutDate;
  /** Instant visé par le décompte. */
  cible?: Date;
  /** Nom du tour pour la phrase lue par les lecteurs d'écran (tours seulement). */
  nomLong?: string;
  /** Date du jour de vote, « 2027-04-18 » (tours seulement). */
  jour?: string;
}

export type Tour = Jalon & { cible: Date; nomLong: string; jour: string };

/** « 2027-04-18 » → « dimanche 18 avril 2027 » (calcul en UTC, comme `dateLongue`, donc sans décalage de fuseau). */
export function jourLong(iso: string): string {
  const [a, m, j] = iso.split('-').map(Number);
  const semaine = new Date(Date.UTC(a!, m! - 1, j!)).toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'UTC' });
  return `${semaine} ${dateLongue(iso)}`;
}

/**
 * Cibles des décomptes : ouverture des bureaux de vote en métropole, 8 h heure de Paris.
 * Le 18 avril et le 2 mai 2027, Paris est à l'heure d'été (CEST, UTC+2) : 08:00 Paris = 06:00 UTC.
 */
export const CIBLE_PREMIER_TOUR = new Date('2027-04-18T06:00:00Z');
export const CIBLE_SECOND_TOUR = new Date('2027-05-02T06:00:00Z');

/** Les quatre dates clés, dans l'ordre chronologique. */
export const JALONS: readonly Jalon[] = [
  {
    id: 'parrainages',
    titre: 'Clôture du dépôt des parrainages',
    // Sixième vendredi avant le 1er tour, 18 h ; le décret de convocation n'est pas encore publié.
    quand: `${dateLongue('2027-03-12')}, 18 h`,
    statut: 'calculé',
  },
  {
    id: 'liste-candidats',
    titre: 'Liste officielle des candidats',
    // Décision du Conseil constitutionnel : à confirmer.
    quand: `publication attendue vers le 16 mars, au plus tard le ${dateLongue('2027-03-26')}`,
    statut: 'calculé',
  },
  { id: 'premier-tour', titre: '1er tour', quand: jourLong('2027-04-18'), statut: 'officiel', cible: CIBLE_PREMIER_TOUR, nomLong: 'Premier tour', jour: '2027-04-18' },
  { id: 'second-tour', titre: '2nd tour', quand: jourLong('2027-05-02'), statut: 'officiel', cible: CIBLE_SECOND_TOUR, nomLong: 'Second tour', jour: '2027-05-02' },
];

const TOURS = JALONS.filter((j): j is Tour => j.cible !== undefined);

/** Le tour dont la cible est la prochaine (une cible atteinte est passée) ; `null` après le 2nd tour. */
export function prochainTour(maintenant: Date): Tour | null {
  return TOURS.find((t) => t.cible.getTime() > maintenant.getTime()) ?? null;
}

export interface Decompte {
  mois: number;
  jours: number;
  heures: number;
  minutes: number;
  secondes: number;
}

const MS_SECONDE = 1000;
const MS_MINUTE = 60 * MS_SECONDE;
const MS_HEURE = 60 * MS_MINUTE;
const MS_JOUR = 24 * MS_HEURE;

/** `t` décalé de `n` mois en UTC, même jour et même heure ; le jour est borné à la fin du mois d'arrivée (31 janvier + 1 mois = 28 février). */
function plusMois(t: Date, n: number): number {
  const mois = t.getUTCMonth() + n;
  const dernierJour = new Date(Date.UTC(t.getUTCFullYear(), mois + 1, 0)).getUTCDate();
  return Date.UTC(t.getUTCFullYear(), mois, Math.min(t.getUTCDate(), dernierJour), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), t.getUTCMilliseconds());
}

/**
 * Temps restant de `maintenant` à `cible` : les mois calendaires entiers, puis le reste en jours, heures, minutes et
 * secondes (arrondies à la seconde inférieure). Tout est à zéro quand la cible est atteinte ou passée.
 *
 * Arithmétique en UTC, sans fuseau : la cible est un instant fixe, et un « jour » vaut toujours 24 h. Le passage à
 * l'heure d'été du 28 mars 2027 n'ajoute donc ni ne retire d'heure : à l'heure de Paris, la veille et le lendemain
 * ne sont éloignés que de 23 h, mais le décompte les sépare bien de 24 h réelles.
 */
export function decompte(maintenant: Date, cible: Date): Decompte {
  const fin = cible.getTime();
  if (maintenant.getTime() >= fin) return { mois: 0, jours: 0, heures: 0, minutes: 0, secondes: 0 };

  let mois = (cible.getUTCFullYear() - maintenant.getUTCFullYear()) * 12 + cible.getUTCMonth() - maintenant.getUTCMonth();
  while (mois > 0 && plusMois(maintenant, mois) > fin) mois--;

  let reste = fin - plusMois(maintenant, mois);
  const jours = Math.floor(reste / MS_JOUR);
  reste -= jours * MS_JOUR;
  const heures = Math.floor(reste / MS_HEURE);
  reste -= heures * MS_HEURE;
  const minutes = Math.floor(reste / MS_MINUTE);
  reste -= minutes * MS_MINUTE;
  return { mois, jours, heures, minutes, secondes: Math.floor(reste / MS_SECONDE) };
}
