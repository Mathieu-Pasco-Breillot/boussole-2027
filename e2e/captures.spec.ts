import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// Captures des écrans principaux (maquette a posteriori, lot 5f) : 390 px de large, thème clair (le seul thème).
// Hors CI : `CAPTURES=1 npx playwright test captures` après `npm run build` ; images dans captures/.
test.skip(!process.env.CAPTURES, 'captures seulement sur demande (CAPTURES=1)');
test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

const DOSSIER = 'captures';

async function capturer(page: Page, nom: string, pleinePage = true): Promise<void> {
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${DOSSIER}/${nom}.png`, fullPage: pleinePage });
}

async function repondre(page: Page): Promise<void> {
  const avant = await page.getByRole('heading', { level: 1 }).first().innerText();
  await page.getByRole('button', { name: "Plutôt d'accord" }).first().click();
  await expect(page.getByRole('heading', { level: 1 }).first()).not.toHaveText(avant);
}

test('écrans principaux', async ({ page }) => {
  test.setTimeout(120_000);
  mkdirSync(DOSSIER, { recursive: true });
  await page.goto('/');
  await capturer(page, '01-accueil');
  await page.getByRole('button', { name: /^Express ·/ }).click();
  await capturer(page, '02-preparation');
  await page.getByRole('button', { name: 'Lancer la partie' }).click();
  const precision = page.getByRole('button', { name: 'Précision ▾' });
  if (await precision.isVisible()) await precision.click();
  await capturer(page, '03-question', false);
  for (let i = 0; i < 20; i++) await repondre(page);
  await expect(page.getByText('Vos résultats')).toBeVisible();
  await capturer(page, '05-resultats');
  // Détail d'un candidat déplié, avec ses sources.
  await page.getByRole('button', { name: /Voir le détail/ }).first().click();
  await capturer(page, '06-resultats-detail', false);
  await page.getByRole('button', { name: /: ouvrir la fiche$/ }).first().click();
  await page.locator('summary').first().click();
  await capturer(page, '07-fiche-candidat');
  await page.getByRole('button', { name: '← Retour aux résultats' }).click();
  await page.getByRole('button', { name: /Jouer au défi/ }).click();
  await capturer(page, '08-defi', false);
  await page.getByRole('list', { name: 'Candidats proposés' }).getByRole('button').first().click();
  await capturer(page, '09-defi-revelation', false);
  await page.goto('/');
  await page.getByRole('button', { name: 'Notre méthode', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'En bref' })).toBeVisible();
  await capturer(page, '10-methode');
  await page.goto('/');
  await page.getByRole('button', { name: 'Candidats', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Comparés/ })).toBeVisible();
  await capturer(page, '11-candidats');
});
