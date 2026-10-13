import { expect, test, type Page } from '@playwright/test';
import { lancer, repondreATout, surveillerErreurs, surveillerReseau } from './outils.ts';

const fond = (page: Page) => page.evaluate(`getComputedStyle(document.documentElement).backgroundColor`);
/** Fond de page du thème clair (--color-fond, app/index.css). */
const CLAIR = 'rgb(247, 248, 251)';

// Un seul thème, clair : il ne dépend ni du réglage du téléphone ni d'un réglage du site.
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`téléphone réglé en ${colorScheme === 'dark' ? 'sombre' : 'clair'}`, () => {
    test.use({ colorScheme });

    test('le site reste clair, sans réglage d’apparence', async ({ page }) => {
      await page.goto('/');
      await expect.poll(() => fond(page)).toBe(CLAIR);
      await expect(page.getByText('Apparence')).toHaveCount(0);
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f7f8fb');
    });
  });
}

test('le son est coupé par défaut, et son réglage est mémorisé', async ({ page }) => {
  await page.goto('/');
  const bouton = page.getByRole('button', { name: /Effets sonores/ });
  await expect(bouton).toHaveAttribute('aria-pressed', 'false');
  await bouton.click();
  await page.reload();
  await expect(page.getByRole('button', { name: /Effets sonores/ })).toHaveAttribute('aria-pressed', 'true');
});

test('son activé : une partie Express complète, sans erreur ni requête (sons générés dans le navigateur)', async ({ page }) => {
  const erreurs = surveillerErreurs(page);
  const externes = surveillerReseau(page);
  await page.goto('/');
  await page.getByRole('button', { name: /Effets sonores/ }).click();
  await page.getByRole('button', { name: /^Express ·/ }).click();
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  await repondreATout(page, 20);
  expect(erreurs).toEqual([]);
  expect(externes).toEqual([]);
});

test("une seule teinte pour l'échelle de réponse (aucune couleur d'accord ou de désaccord), et une seule couleur pour les barres de score", async ({ page }) => {
  await lancer(page, 'Express');
  const couleurs = (await page.evaluate(`(() => {
    const libelles = ["Tout à fait d'accord", "Plutôt d'accord", "Ni d'accord, ni pas d'accord", "Plutôt pas d'accord", "Pas du tout d'accord"];
    const boutons = [...document.querySelectorAll('button')];
    return libelles.map((l) => {
      const b = boutons.find((x) => x.textContent === l);
      const s = getComputedStyle(b);
      return [s.backgroundColor, s.borderColor, s.color].join('|');
    });
  })()`)) as string[];
  // Les cinq boutons sont identiques (fond, bordure, texte) tant qu'aucun n'est choisi.
  expect(couleurs).toHaveLength(5);
  expect(new Set(couleurs).size).toBe(1);

  await repondreATout(page, 20);
  await page.getByRole('button', { name: "Passer l'animation" }).click({ timeout: 1000 }).catch(() => undefined);
  // Le remplissage d'un <progress> est porté par son pseudo-élément (Chromium) : c'est lui qu'on lit.
  const barres = (await page.evaluate(`[...document.querySelectorAll('[data-barre-score]')].map((b) => getComputedStyle(b, '::-webkit-progress-value').backgroundColor)`)) as string[];
  expect(barres.length).toBeGreaterThan(0);
  expect(new Set(barres).size).toBe(1);
  expect(barres[0]).not.toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
});
