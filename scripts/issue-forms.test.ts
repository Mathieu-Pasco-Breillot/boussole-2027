import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { chargerDataset } from './lib/dataset.ts';
import {
  ErreurFormulaire,
  genererFormulaire,
  nomsDeZones,
  OPTION_AUTRE,
  optionsCandidats,
  optionsQuestions,
  remplacerZone,
  tronquer,
  verifierUnicite,
  zonesGenerees,
  ZONES_PAR_FORMULAIRE,
} from './lib/issue-forms.ts';
import { jeuSynthetique } from './lib/jeu-synthetique.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, '.github', 'ISSUE_TEMPLATE');
const reel = chargerDataset(racine);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Libre = any;

describe('tronquer', () => {
  it('laisse intact un texte court', () => {
    expect(tronquer('Court.')).toBe('Court.');
  });
  it('tronque à 80 caractères au plus, « … » compris', () => {
    const t = tronquer('mot '.repeat(40));
    expect([...t].length).toBeLessThanOrEqual(80);
    expect(t.endsWith('…')).toBe(true);
  });
  it('ne coupe pas au milieu d’un caractère et normalise les espaces', () => {
    expect(tronquer('a\n  b')).toBe('a b');
    expect([...tronquer('é'.repeat(100))].length).toBe(80);
  });
});

describe('verifierUnicite', () => {
  it('accepte des options distinctes', () => {
    expect(() => verifierUnicite('x', ['a', 'b'])).not.toThrow();
  });
  it('échoue avec un message explicite sur un doublon', () => {
    expect(() => verifierUnicite('candidats', ['a', 'b', 'a'])).toThrow(/candidats.*en double.*« a »/);
  });
});

describe('options issues du jeu synthétique', () => {
  it('trie les candidats par nom et préfixe « Autre »', () => {
    const ds: Libre = structuredClone(jeuSynthetique());
    ds.candidats.candidats = [
      { ...ds.candidats.candidats[0], id: 'zeta-anne', prenom: 'Anne', nom: 'Zeta' },
      { ...ds.candidats.candidats[0], id: 'alpha-paul', prenom: 'Paul', nom: 'Alpha' },
      { ...ds.candidats.candidats[0], id: 'eclair-luc', prenom: 'Luc', nom: 'Éclair' },
    ];
    expect(optionsCandidats(ds)).toEqual([
      OPTION_AUTRE,
      'Paul Alpha (alpha-paul)',
      'Luc Éclair (eclair-luc)',
      'Anne Zeta (zeta-anne)',
    ]);
  });

  it('écarte les questions suspendues et archivées, trie par identifiant et tronque', () => {
    const ds: Libre = structuredClone(jeuSynthetique());
    const modele = Object.values<Libre>(ds.questions)[0].questions[0];
    const q = (id: string, statut: string, enonce = 'Énoncé.') => ({ ...modele, id, statut, enonce });
    ds.questions = {
      a: { questions: [q('ECO-003', 'active', 'x'.repeat(200)), q('ECO-001', 'suspendue')] },
      b: { questions: [q('DEF-002', 'active'), q('DEF-009', 'archivee')] },
    };
    const options = optionsQuestions(ds);
    expect(options.slice(0, 3)).toEqual([OPTION_AUTRE, 'DEF-002 · Énoncé.', `ECO-003 · ${'x'.repeat(79)}…`]);
    expect(options).toHaveLength(3);
  });
});

describe('remplacerZone', () => {
  const modele = ['options:', '  # BEGIN GENERATED:liste', '  - "vieux"', '  # END GENERATED:liste', 'suite: oui'].join('\n');

  it('remplace le contenu en conservant l’indentation et le reste du texte', () => {
    const r = remplacerZone(modele, 'liste', ['A', 'B "c"']);
    expect(r).toBe(
      ['options:', '  # BEGIN GENERATED:liste', '  - "A"', '  - "B \\"c\\""', '  # END GENERATED:liste', 'suite: oui'].join('\n'),
    );
  });
  it('est idempotent', () => {
    const une = remplacerZone(modele, 'liste', ['A', 'B']);
    expect(remplacerZone(une, 'liste', ['A', 'B'])).toBe(une);
  });
  it('échoue si la zone est absente, dupliquée ou inversée', () => {
    expect(() => remplacerZone('rien', 'liste', [])).toThrow(ErreurFormulaire);
    expect(() => remplacerZone(`${modele}\n${modele}`, 'liste', [])).toThrow(/BEGIN et une balise END/);
    expect(() => remplacerZone('# END GENERATED:liste\n# BEGIN GENERATED:liste', 'liste', [])).toThrow(/END précède BEGIN/);
  });
  it('normalise les fins de ligne CRLF sans fins de ligne mélangées', () => {
    const r = remplacerZone(modele.replace(/\n/g, '\r\n'), 'liste', ['A']);
    expect(r).not.toContain('\r');
    expect(r).toBe(remplacerZone(modele, 'liste', ['A']));
  });
});

describe('nomsDeZones', () => {
  it('liste les zones balisées, y compris dans un texte CRLF', () => {
    expect(nomsDeZones('# BEGIN GENERATED:a\r\n# END GENERATED:a\r\n# BEGIN GENERATED:b\r\n# END GENERATED:b')).toEqual(['a', 'b']);
  });
  it('échoue sur une balise END orpheline ou de nom inconnu', () => {
    expect(() => nomsDeZones('# END GENERATED:a')).toThrow(/END sans BEGIN.*a/);
    expect(() => nomsDeZones('# BEGIN GENERATED:a\n# END GENERATED:a\n# END GENERATED:b')).toThrow(/END sans BEGIN.*b/);
  });
  it('échoue sur une balise BEGIN sans END', () => {
    expect(() => nomsDeZones('# BEGIN GENERATED:a')).toThrow(/BEGIN sans END.*a/);
  });
});

describe('genererFormulaire', () => {
  const modele = '# BEGIN GENERATED:a\n# END GENERATED:a';
  it('échoue sur une zone attendue absente du texte', () => {
    expect(() => genererFormulaire('rien', ['a'], { a: ['x'] })).toThrow(ErreurFormulaire);
  });
  it('échoue sur une zone non déclarée', () => {
    expect(() => genererFormulaire(modele, [], {})).toThrow(/zone inconnue : a/);
  });
  it('échoue si les données de la zone manquent', () => {
    expect(() => genererFormulaire(modele, ['a'], {})).toThrow(/aucune donnée/);
  });
  it('rend un texte en LF à partir d’un texte CRLF', () => {
    const r = genererFormulaire(modele.replace(/\n/g, '\r\n'), ['a'], { a: ['x'] });
    expect(r).toBe('# BEGIN GENERATED:a\n- "x"\n# END GENERATED:a');
  });
  it('échoue sur une balise END orpheline', () => {
    expect(() => genererFormulaire(`${modele}\n# END GENERATED:z`, ['a'], { a: ['x'] })).toThrow(/END sans BEGIN.*z/);
  });
});

describe('formulaires du dépôt', () => {
  const zones = zonesGenerees(reel);
  const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.yml') && f !== 'config.yml').sort();

  it('déclarent exactement les formulaires présents', () => {
    expect(fichiers).toEqual(Object.keys(ZONES_PAR_FORMULAIRE).sort());
  });

  it('listent tous les candidats et seulement les questions actives', () => {
    expect(zones.candidats).toHaveLength(reel.candidats.candidats.length + 1);
    const actives = Object.values(reel.questions).flatMap((f) => f.questions).filter((q) => q.statut === 'active');
    expect(zones.questions).toHaveLength(actives.length + 1);
  });

  for (const fichier of fichiers) {
    describe(fichier, () => {
      const texte = readFileSync(join(dossier, fichier), 'utf8');
      const formulaire = load(texte) as Libre;

      it('est à jour par rapport à data/ (npm run forms:generate)', () => {
        expect(genererFormulaire(texte, ZONES_PAR_FORMULAIRE[fichier], zones)).toBe(texte);
        expect(nomsDeZones(texte).sort()).toEqual([...ZONES_PAR_FORMULAIRE[fichier]].sort());
      });

      it('est un YAML de formulaire valide : titre, libellés, corps', () => {
        expect(typeof formulaire.name).toBe('string');
        expect(typeof formulaire.description).toBe('string');
        expect(typeof formulaire.title).toBe('string');
        expect(formulaire.labels).toContain('contestation');
        expect(Array.isArray(formulaire.body)).toBe(true);
        expect(formulaire.body[0].type).toBe('markdown');
      });

      it('a des id uniques et des libellés uniques', () => {
        const champs = formulaire.body.filter((b: Libre) => b.type !== 'markdown');
        const ids = champs.map((b: Libre) => b.id);
        expect(ids.every((i: unknown) => typeof i === 'string' && i.length > 0)).toBe(true);
        expect(new Set(ids).size).toBe(ids.length);
        const libelles = champs.map((b: Libre) => b.attributes.label);
        expect(new Set(libelles).size).toBe(libelles.length);
      });

      it('a des listes déroulantes dont les options sont des chaînes uniques', () => {
        const listes = formulaire.body.filter((b: Libre) => b.type === 'dropdown');
        expect(listes.length).toBeGreaterThan(0);
        for (const l of listes) {
          expect(l.attributes.options.every((o: unknown) => typeof o === 'string')).toBe(true);
          expect(new Set(l.attributes.options).size).toBe(l.attributes.options.length);
        }
      });

      it('a des cases à cocher avec libellés uniques', () => {
        for (const c of formulaire.body.filter((b: Libre) => b.type === 'checkboxes')) {
          const libelles = c.attributes.options.map((o: Libre) => o.label);
          expect(libelles.every((l: unknown) => typeof l === 'string')).toBe(true);
          expect(new Set(libelles).size).toBe(libelles.length);
        }
      });
    });
  }

  it('le formulaire de position liste « Autre » en tête des listes générées', () => {
    const f = load(readFileSync(join(dossier, 'contestation-position.yml'), 'utf8')) as Libre;
    for (const id of ['candidat', 'question']) {
      const liste = f.body.find((b: Libre) => b.id === id);
      expect(liste.attributes.options[0]).toBe(OPTION_AUTRE);
      expect(liste.validations.required).toBe(true);
    }
  });

  it('config.yml garde les issues vierges (bug, accessibilité) et les liens de contact', () => {
    const c = load(readFileSync(join(dossier, 'config.yml'), 'utf8')) as Libre;
    expect(c.blank_issues_enabled).toBe(true);
    expect(c.contact_links).toHaveLength(2);
  });
});
