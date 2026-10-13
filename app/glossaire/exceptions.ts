/**
 * Mots en capitales des textes affichés qui ne sont pas des sigles à expliquer (issue #7), avec la raison de
 * l'exception. Le test d'exhaustivité (app/glossaire.test.ts) exige que tout autre mot en capitales ait son entrée
 * au glossaire, et que chaque exception soit encore utilisée. Sans DOM : lu par node.
 */
const MARQUEUR = "marqueur d'anonymisation du défi";
const IDENTIFIANT = 'préfixe d’identifiant de question (journal des modifications)';

export const EXCEPTIONS_GLOSSAIRE: ReadonlyMap<string, string> = new Map([
  ['CANDIDAT', MARQUEUR],
  ['PARTI', MARQUEUR],
  ['SLOGAN', MARQUEUR],
  ['DEF', IDENTIFIANT],
  ['ECO', IDENTIFIANT],
  ['EDU', IDENTIFIANT],
  ['ENV', IDENTIFIANT],
  ['EUR', IDENTIFIANT],
  ['FIS', IDENTIFIANT],
  ['IMM', IDENTIFIANT],
  ['INS', IDENTIFIANT],
  ['RET', IDENTIFIANT],
  ['SAN', IDENTIFIANT],
  ['SEC', IDENTIFIANT],
  ['VALIDÉ', 'mot mis en capitales pour l’emphase (statut de la méthodologie)'],
  ['CNS', 'code de procédure d’une référence documentaire européenne (« 2018/0073(CNS) »)'],
  ['II', 'chiffre romain (« Messmer II »)'],
  ['GP', 'fragment du nom propre d’un média (« GP-TV »)'],
  ['TV', 'fragment du nom propre d’un média (« GP-TV »)'],
  ['README', 'nom de fichier du dépôt'],
]);
