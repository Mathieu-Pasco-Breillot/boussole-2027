import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

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
