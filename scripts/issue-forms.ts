/**
 * Met à jour les listes déroulantes des formulaires d'issue (npm run forms:generate)
 * ou vérifie qu'elles sont à jour (npm run forms:check). Les zones `# BEGIN GENERATED:<nom>`
 * de .github/ISSUE_TEMPLATE/*.yml sont générées depuis data/ : on ne les édite jamais à la main.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerDataset, ErreurLecture } from './lib/dataset.ts';
import { ErreurFormulaire, genererFormulaire, zonesGenerees, ZONES_PAR_FORMULAIRE } from './lib/issue-forms.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, '.github', 'ISSUE_TEMPLATE');
const verifier = process.argv.includes('--check');

try {
  const zones = zonesGenerees(chargerDataset(racine));

  // config.yml n'est pas un formulaire ; tout autre YAML doit être déclaré dans ZONES_PAR_FORMULAIRE.
  const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.yml') && f !== 'config.yml').sort();
  const inconnus = fichiers.filter((f) => !(f in ZONES_PAR_FORMULAIRE));
  const absents = Object.keys(ZONES_PAR_FORMULAIRE).filter((f) => !existsSync(join(dossier, f)));
  if (inconnus.length + absents.length > 0) {
    throw new ErreurFormulaire(
      `formulaires non déclarés dans ZONES_PAR_FORMULAIRE : ${inconnus.join(', ') || '—'} ; déclarés mais absents : ${absents.join(', ') || '—'}`,
    );
  }

  let obsoletes = 0;
  for (const fichier of fichiers) {
    const chemin = join(dossier, fichier);
    const actuel = readFileSync(chemin, 'utf8');
    const attendu = genererFormulaire(actuel, ZONES_PAR_FORMULAIRE[fichier], zones);
    if (verifier) {
      if (actuel !== attendu) {
        console.error(`✗ .github/ISSUE_TEMPLATE/${fichier} n'est pas à jour.`);
        obsoletes++;
      } else {
        console.log(`✓ .github/ISSUE_TEMPLATE/${fichier}`);
      }
    } else {
      if (actuel !== attendu) writeFileSync(chemin, attendu);
      console.log(`✓ .github/ISSUE_TEMPLATE/${fichier} ${actuel === attendu ? 'inchangé' : 'écrit'}`);
    }
  }
  if (obsoletes > 0) {
    console.error('\nLancer `npm run forms:generate` et committer les formulaires.');
    process.exit(1);
  }
  console.log(`${zones.candidats.length - 1} candidats, ${zones.questions.length - 1} questions actives listés.`);
} catch (e) {
  if (e instanceof ErreurLecture || e instanceof ErreurFormulaire) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
  throw e;
}
