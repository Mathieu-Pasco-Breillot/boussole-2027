import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Versions des données et de l'application, lues dans le manifeste release-please à la compilation.
const manifeste = JSON.parse(readFileSync('.release-please-manifest.json', 'utf8')) as Record<string, string>;

test("l'accueil affiche la version des données et celle de l'application", async ({ page }) => {
  await page.goto('/');
  const versions = page.getByTestId('versions');
  await expect(versions).toContainText(`Données v${manifeste.data}`);
  await expect(versions).toContainText(`application v${manifeste['.']}`);
  await expect(versions.getByRole('link', { name: 'Notes de version' })).toHaveAttribute('href', /\/releases$/);
});

test('la page Méthode détaille les versions dans l’onglet du journal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Méthode', exact: true }).click();
  await page.getByRole('tab', { name: 'Journal des modifications' }).click();
  const encadre = page.getByTestId('encadre-versions');
  await expect(encadre).toContainText(`Données : v${manifeste.data}`);
  await expect(encadre).toContainText(`Application : v${manifeste['.']}`);
});
