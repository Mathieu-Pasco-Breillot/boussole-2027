import { describe, expect, it } from 'vitest';
import { CIBLE_PREMIER_TOUR, CIBLE_SECOND_TOUR, JALONS, decompte, jourLong, prochainTour } from './calendrier.ts';

const d = (iso: string) => new Date(iso);
const zero = { mois: 0, jours: 0, heures: 0, minutes: 0, secondes: 0 };

describe('decompte', () => {
  it('cas nominal : jours, heures, minutes, secondes', () => {
    expect(decompte(d('2027-04-16T04:55:30Z'), d('2027-04-18T06:00:00Z'))).toEqual({ mois: 0, jours: 2, heures: 1, minutes: 4, secondes: 30 });
  });
  it('compte les mois calendaires entiers, puis le reste', () => {
    expect(decompte(d('2026-10-14T06:00:00Z'), CIBLE_PREMIER_TOUR)).toEqual({ mois: 6, jours: 4, heures: 0, minutes: 0, secondes: 0 });
  });
  it('à la seconde près : 10 s avant la cible', () => {
    expect(decompte(d('2027-04-18T05:59:50Z'), CIBLE_PREMIER_TOUR)).toEqual({ ...zero, secondes: 10 });
  });
  it('ignore les millisecondes en arrondissant à la seconde inférieure', () => {
    expect(decompte(d('2027-04-18T05:59:50.400Z'), CIBLE_PREMIER_TOUR)).toEqual({ ...zero, secondes: 9 });
  });
  it('égalité exacte avec la cible : tout à zéro', () => {
    expect(decompte(CIBLE_PREMIER_TOUR, CIBLE_PREMIER_TOUR)).toEqual(zero);
  });
  it('cible passée : tout à zéro, jamais de valeur négative', () => {
    expect(decompte(d('2027-04-18T06:00:01Z'), CIBLE_PREMIER_TOUR)).toEqual(zero);
    expect(decompte(d('2030-01-01T00:00:00Z'), CIBLE_PREMIER_TOUR)).toEqual(zero);
  });
  it('fin de mois : du 31 janvier au 31 mars, deux mois pile', () => {
    expect(decompte(d('2027-01-31T06:00:00Z'), d('2027-03-31T06:00:00Z'))).toEqual({ ...zero, mois: 2 });
  });
  it('fin de mois : le 31 janvier + 1 mois retombe sur le 28 février (jour borné au mois d\'arrivée)', () => {
    expect(decompte(d('2027-01-31T10:00:00Z'), d('2027-03-01T06:00:00Z'))).toEqual({ mois: 1, jours: 0, heures: 20, minutes: 0, secondes: 0 });
  });
  it('un jour dure 24 h : le changement d\'heure du 28 mars 2027 n\'ajoute ni ne retire d\'heure', () => {
    expect(decompte(d('2027-03-27T12:00:00Z'), d('2027-03-29T12:00:00Z'))).toEqual({ ...zero, jours: 2 });
    expect(decompte(d('2027-03-28T00:30:00Z'), d('2027-03-28T05:45:10Z'))).toEqual({ mois: 0, jours: 0, heures: 5, minutes: 15, secondes: 10 });
  });
  it('traverse le changement d\'heure avec des mois entiers', () => {
    expect(decompte(d('2027-02-28T06:00:00Z'), CIBLE_PREMIER_TOUR)).toEqual({ mois: 1, jours: 21, heures: 0, minutes: 0, secondes: 0 });
  });
});

describe('prochainTour', () => {
  it('le 1er tour tant que sa cible n\'est pas atteinte', () => {
    expect(prochainTour(d('2026-10-14T00:00:00Z'))?.id).toBe('premier-tour');
    expect(prochainTour(d('2027-04-18T05:59:59Z'))?.id).toBe('premier-tour');
  });
  it('le 2nd tour pile à la cible du 1er et après', () => {
    expect(prochainTour(CIBLE_PREMIER_TOUR)?.id).toBe('second-tour');
    expect(prochainTour(d('2027-04-18T06:00:01Z'))?.id).toBe('second-tour');
    expect(prochainTour(d('2027-05-02T05:59:59Z'))?.id).toBe('second-tour');
  });
  it('null pile à la cible du 2nd tour et après', () => {
    expect(prochainTour(CIBLE_SECOND_TOUR)).toBeNull();
    expect(prochainTour(d('2027-06-01T00:00:00Z'))).toBeNull();
  });
});

describe('dates affichées', () => {
  it('jour de la semaine en français, sur une date ISO', () => {
    expect(jourLong('2027-04-18')).toBe('dimanche 18 avril 2027');
    expect(jourLong('2027-05-02')).toBe('dimanche 2 mai 2027');
    expect(jourLong('2027-03-12')).toBe('vendredi 12 mars 2027');
  });
  it('quatre dates clés dans l\'ordre, chacune « officiel » ou « calculé »', () => {
    expect(JALONS.map((j) => j.id)).toEqual(['parrainages', 'liste-candidats', 'premier-tour', 'second-tour']);
    expect(JALONS.map((j) => j.statut)).toEqual(['calculé', 'calculé', 'officiel', 'officiel']);
  });
  it('les tours sont les seuls jalons à avoir une cible de décompte', () => {
    expect(JALONS.filter((j) => j.cible).map((j) => j.id)).toEqual(['premier-tour', 'second-tour']);
  });
});
