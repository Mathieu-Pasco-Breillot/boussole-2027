import type { Dataset } from './dataset.ts';

/**
 * Génération des listes déroulantes des formulaires d'issue (.github/ISSUE_TEMPLATE/*.yml) depuis data/.
 * Le reste de chaque YAML est écrit à la main ; seules les zones balisées
 * `# BEGIN GENERATED:<nom>` / `# END GENERATED:<nom>` sont réécrites.
 */

export const OPTION_AUTRE = 'Autre / absent de la liste';
export const LONGUEUR_MAX_ENONCE = 80;

/** Zones générées attendues dans chaque formulaire (chemin relatif à .github/ISSUE_TEMPLATE). */
export const ZONES_PAR_FORMULAIRE: Record<string, readonly string[]> = {
  'contestation-position.yml': ['candidats', 'questions'],
  'contestation-regle-codage.yml': [],
};

export class ErreurFormulaire extends Error {}

/** Tronque à `max` caractères au plus, « … » compris. */
export function tronquer(texte: string, max = LONGUEUR_MAX_ENONCE): string {
  const propre = texte.replace(/\s+/g, ' ').trim();
  const signes = [...propre];
  if (signes.length <= max) return propre;
  return `${signes.slice(0, max - 1).join('').trimEnd()}…`;
}

/** Lève une erreur explicite si une option apparaît deux fois dans la liste `nom`. */
export function verifierUnicite(nom: string, options: readonly string[]): void {
  const vus = new Set<string>();
  for (const option of options) {
    if (vus.has(option)) throw new ErreurFormulaire(`liste « ${nom} » : option en double « ${option} »`);
    vus.add(option);
  }
}

/** Candidats triés par nom puis prénom : « Prénom Nom (id) », « Autre / absent de la liste » en tête. */
export function optionsCandidats(ds: Pick<Dataset, 'candidats'>): string[] {
  const tries = [...ds.candidats.candidats].sort(
    (a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr') || a.id.localeCompare(b.id),
  );
  const options = [OPTION_AUTRE, ...tries.map((c) => `${c.prenom} ${c.nom} (${c.id})`)];
  verifierUnicite('candidats', options);
  return options;
}

/** Questions actives (ni suspendues ni archivées) triées par identifiant : « ECO-003 · énoncé tronqué ». */
export function optionsQuestions(ds: Pick<Dataset, 'questions'>): string[] {
  const actives = Object.values(ds.questions)
    .flatMap((fichier) => fichier.questions)
    .filter((q) => q.statut === 'active')
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const options = [OPTION_AUTRE, ...actives.map((q) => `${q.id} · ${tronquer(q.enonce)}`)];
  verifierUnicite('questions', options);
  return options;
}

/** Zones générées, par nom de zone. */
export function zonesGenerees(ds: Pick<Dataset, 'candidats' | 'questions'>): Record<string, string[]> {
  return { candidats: optionsCandidats(ds), questions: optionsQuestions(ds) };
}

/** Une option par ligne, en chaîne YAML entre guillemets (une chaîne JSON est un scalaire YAML valide). */
function ligneOption(option: string, indentation: string): string {
  return `${indentation}- ${JSON.stringify(option)}`;
}

/** Fins de ligne CRLF ramenées à LF : évite des fins de ligne mélangées après réécriture. */
function normaliser(texte: string): string {
  return texte.replace(/\r\n/g, '\n');
}

/**
 * Remplace le contenu de la zone `nom`. L'indentation est celle de la ligne BEGIN.
 * Lève ErreurFormulaire si une des balises est absente, dupliquée ou mal ordonnée.
 */
export function remplacerZone(texte: string, nom: string, options: readonly string[]): string {
  const lignes = normaliser(texte).split('\n');
  const debut = lignes.flatMap((l, i) => (l.trim() === `# BEGIN GENERATED:${nom}` ? [i] : []));
  const fin = lignes.flatMap((l, i) => (l.trim() === `# END GENERATED:${nom}` ? [i] : []));
  if (debut.length !== 1 || fin.length !== 1) {
    throw new ErreurFormulaire(`zone « ${nom} » : une balise BEGIN et une balise END sont attendues (trouvé ${debut.length} et ${fin.length})`);
  }
  if (fin[0] < debut[0]) throw new ErreurFormulaire(`zone « ${nom} » : END précède BEGIN`);
  const indentation = lignes[debut[0]].match(/^\s*/)![0];
  return [
    ...lignes.slice(0, debut[0] + 1),
    ...options.map((o) => ligneOption(o, indentation)),
    ...lignes.slice(fin[0]),
  ].join('\n');
}

/**
 * Noms des zones balisées présentes dans le texte.
 * Lève ErreurFormulaire si une balise END n'a pas de BEGIN du même nom (orpheline ou de nom inconnu)
 * ou si une balise BEGIN n'a pas de END.
 */
export function nomsDeZones(texte: string): string[] {
  const propre = normaliser(texte);
  const noms = (balise: 'BEGIN' | 'END') =>
    [...propre.matchAll(new RegExp(`^\\s*# ${balise} GENERATED:(\\S+)\\s*$`, 'gm'))].map((m) => m[1]);
  const debuts = noms('BEGIN');
  const fins = noms('END');
  const orphelines = fins.filter((n) => !debuts.includes(n));
  if (orphelines.length > 0) throw new ErreurFormulaire(`balise END sans BEGIN correspondant : ${orphelines.join(', ')}`);
  const sansFin = debuts.filter((n) => !fins.includes(n));
  if (sansFin.length > 0) throw new ErreurFormulaire(`balise BEGIN sans END correspondant : ${sansFin.join(', ')}`);
  return debuts;
}

/**
 * Applique toutes les zones attendues à un formulaire. Échoue si une zone attendue manque
 * ou si le texte contient une zone que le générateur ne connaît pas.
 */
export function genererFormulaire(texte: string, attendues: readonly string[], zones: Record<string, string[]>): string {
  const presentes = nomsDeZones(texte);
  const inconnues = presentes.filter((n) => !attendues.includes(n));
  if (inconnues.length > 0) throw new ErreurFormulaire(`zone inconnue : ${inconnues.join(', ')}`);
  let resultat = normaliser(texte);
  for (const nom of attendues) {
    const options = zones[nom];
    if (!options) throw new ErreurFormulaire(`zone « ${nom} » : aucune donnée à générer`);
    resultat = remplacerZone(resultat, nom, options);
  }
  return resultat;
}
