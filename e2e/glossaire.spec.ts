import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { lancer } from './outils.ts';

/**
 * Glossaire des sigles (issue #7). Téléphone : projet par défaut (Pixel 7, écran tactile, sans survol) ; feuille du
 * bas modale. Ordinateur : 1280 × 800, sans écran tactile, avec survol ; bulle et panneau latéral.
 * Pas de `document` ni de `matchMedia` dans une fonction passée à page.evaluate (tsconfig.node.json sans DOM) :
 * expression en chaîne, comme theme.spec.ts.
 */

const ORDINATEUR = { viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false };

async function verifierAxe(page: Page, nom: string): Promise<void> {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${nom} : ${v.id} (${v.nodes.length})`), nom).toEqual([]);
}

/** Sigles de la liste du glossaire, dans l'ordre affiché. */
async function siglesListes(conteneur: Locator): Promise<string[]> {
  return conteneur.locator('li[id^="glossaire-"]').evaluateAll((els) => els.map((e) => e.id.slice('glossaire-'.length)));
}

/** Banque de questions, chapitre Fiscalité déplié : FIS-015, FIS-019 et FIS-020 contiennent « TVA ». */
async function ouvrirBanqueFiscalite(page: Page): Promise<Locator> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Questions', exact: true }).click();
  await page.locator('summary', { hasText: 'Fiscalité' }).click();
  return page.locator('details[open] .sigle-bouton[data-sigle="TVA"]').first();
}

/** Fiche de Marine Le Pen, tous chapitres dépliés (énoncés et extraits annotés). */
async function ouvrirFicheDepliee(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Candidats', exact: true }).click();
  await page.getByRole('button', { name: /Marine Le Pen/ }).click();
  // all() n'attend pas : attendre que la fiche soit rendue.
  await expect(page.locator('summary').first()).toBeVisible();
  for (const s of await page.locator('summary').all()) await s.click();
}

/** Un sigle cliquable dans un lien, un bouton, un résumé ou une étiquette serait un contrôle imbriqué. */
const IMBRIQUES = 'a .sigle, button .sigle, summary .sigle, label .sigle';

for (const theme of ['dark', 'light'] as const) {
  test.describe(`bouton Glossaire (thème ${theme === 'dark' ? 'sombre' : 'clair'})`, () => {
    test.use({ colorScheme: theme });

    test('téléphone : le bouton ouvre la feuille, Échap la ferme et rend le focus', async ({ page }) => {
      await page.goto('/');
      // Fermé, le glossaire n'est pas dans la page (parcours.spec.ts y cherche des noms de partis pendant le quiz).
      await expect(page.locator('body')).not.toContainText('Taxe sur la valeur ajoutée');
      const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
      await expect(bouton).toHaveAttribute('aria-expanded', 'false');
      await bouton.tap();
      const feuille = page.getByRole('dialog', { name: 'Glossaire' });
      await expect(feuille).toBeVisible();
      await expect(bouton).toHaveAttribute('aria-expanded', 'true');
      const sigles = await siglesListes(feuille);
      expect(sigles).toContain('TVA');
      expect(sigles).toEqual([...sigles].sort((a, b) => a.localeCompare(b, 'fr')));
      await expect(feuille.locator('[aria-current]')).toHaveCount(0);
      await verifierAxe(page, 'feuille ouverte par le bouton');
      await page.keyboard.press('Escape');
      await expect(feuille).toBeHidden();
      await expect(bouton).toBeFocused();
      await expect(page.locator('body')).not.toContainText('Taxe sur la valeur ajoutée');
    });

    test('téléphone : la feuille se ferme par son bouton et par un tap sur le fond', async ({ page }) => {
      await page.goto('/');
      const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
      const feuille = page.getByRole('dialog', { name: 'Glossaire' });
      await bouton.tap();
      await feuille.getByRole('button', { name: 'Fermer le glossaire' }).tap();
      await expect(feuille).toBeHidden();
      await expect(bouton).toBeFocused();
      await bouton.tap();
      await expect(feuille).toBeVisible();
      // En haut de l'écran, au-dessus de la feuille (85 % de la hauteur au plus) : le fond.
      await page.touchscreen.tap(200, 20);
      await expect(feuille).toBeHidden();
      await expect(bouton).toBeFocused();
    });

    test.describe('ordinateur', () => {
      test.use(ORDINATEUR);

      test('le bouton ouvre le panneau, qui réserve sa largeur, puis le rétracte', async ({ page }) => {
        await page.goto('/');
        const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
        await bouton.click();
        const panneau = page.getByRole('complementary', { name: 'Glossaire' });
        await expect(panneau).toBeVisible();
        await expect(bouton).toHaveAttribute('aria-expanded', 'true');
        expect(await siglesListes(panneau)).toContain('TVA');
        // Le contenu, centré, se range à gauche du panneau au lieu de passer dessous.
        const contenu = (await page.locator('main').boundingBox())!;
        const cote = (await panneau.boundingBox())!;
        expect(contenu.x + contenu.width).toBeLessThanOrEqual(cote.x);
        await verifierAxe(page, 'panneau ouvert par le bouton');
        await bouton.click();
        await expect(panneau).toBeHidden();
        await expect(bouton).toHaveAttribute('aria-expanded', 'false');
        await bouton.click();
        await panneau.getByRole('button', { name: 'Fermer le glossaire' }).click();
        await expect(panneau).toBeHidden();
        await expect(bouton).toBeFocused();
      });
    });
  });
}

test.describe('sigles dans les textes', () => {
  test('les textes sont annotés, jamais à l’intérieur d’un contrôle', async ({ page }) => {
    await ouvrirBanqueFiscalite(page);
    await expect(page.locator('details[open] .sigle-bouton[data-sigle="TVA"]')).toHaveCount(3);
    for (const s of await page.locator('summary').all()) await s.click();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);

    await ouvrirFicheDepliee(page);
    await expect(page.locator('.sigle-bouton:visible').first()).toBeVisible();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);

    await page.goto('/');
    await page.getByRole('button', { name: 'Méthode', exact: true }).click();
    for (const onglet of ['Méthodologie', 'Grille de codage', "Critère d'inclusion", 'Journal des modifications']) {
      await page.getByRole('tab', { name: onglet }).click();
      await expect(page.getByRole('tabpanel')).not.toContainText('Chargement…');
      await expect(page.locator(IMBRIQUES), onglet).toHaveCount(0);
    }

    await lancer(page, 'Express');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);
  });

  test('le nom accessible et le texte d’un énoncé ne changent pas', async ({ page }) => {
    const tva = await ouvrirBanqueFiscalite(page);
    await expect(tva).toHaveAccessibleName('TVA');
    const ligne = page.locator('details[open] li').filter({ has: page.locator('.sigle-bouton[data-sigle="TVA"]') }).first();
    // Le (i) est un pseudo-élément : il n'entre ni dans le texte ni dans le nom accessible.
    await expect(ligne).not.toContainText('TVAi');
    await expect(ligne).toContainText(/FIS-0\d\d · La TVA /);
  });

  test('téléphone : un tap sur un sigle ouvre la feuille sur sa définition', async ({ page }) => {
    const tva = await ouvrirBanqueFiscalite(page);
    await tva.tap();
    const feuille = page.getByRole('dialog', { name: 'Glossaire' });
    await expect(feuille.locator('[data-definition-demandee]')).toContainText('Taxe sur la valeur ajoutée');
    await expect(feuille.locator('#glossaire-TVA')).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(tva).toBeFocused();
  });

  test.describe('ordinateur', () => {
    test.use(ORDINATEUR);

    test('le survol montre la bulle ; le clic ouvre le panneau sur l’entrée', async ({ page }) => {
      const tva = await ouvrirBanqueFiscalite(page);
      await tva.hover();
      const bulle = page.getByRole('tooltip');
      await expect(bulle).toContainText('Taxe sur la valeur ajoutée');
      await expect(tva).toHaveAttribute('aria-describedby', (await bulle.getAttribute('id'))!);
      await tva.click();
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      await expect(panneau.locator('#glossaire-TVA')).toHaveAttribute('aria-current', 'true');
      await expect(tva).toBeFocused();
    });

    test('panneau déjà ouvert : à la fermeture, le focus revient au dernier sigle cliqué, même après un changement d’écran', async ({ page }) => {
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      const fermer = panneau.getByRole('button', { name: 'Fermer le glossaire' });

      // Deux sigles du même écran : le focus revient au second, celui où l'on se trouvait.
      const tva = await ouvrirBanqueFiscalite(page);
      await tva.click();
      await expect(panneau).toBeVisible();
      const autre = page.locator('details[open] .sigle-bouton[data-sigle="TVA"]').nth(2);
      await autre.click();
      await fermer.click();
      await expect(panneau).toBeHidden();
      await expect(autre).toBeFocused();

      // Le sigle d'ouverture disparaît avec l'écran (le panneau, non modal, reste ouvert) : le focus ne se perd pas.
      await tva.click();
      await expect(panneau).toBeVisible();
      await page.getByRole('button', { name: '← Retour' }).click();
      await expect(tva).toHaveCount(0);
      await page.getByRole('button', { name: 'Questions', exact: true }).click();
      await page.locator('summary', { hasText: 'Fiscalité' }).click();
      const apres = page.locator('details[open] .sigle-bouton[data-sigle="TVA"]').first();
      await apres.click();
      await fermer.click();
      await expect(panneau).toBeHidden();
      await expect(apres).toBeFocused();
    });
  });
});
