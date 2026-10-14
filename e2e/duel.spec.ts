import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { surveillerErreurs, surveillerReseau } from './outils.ts';

/** Ouvre le mode duel, choisit le premier candidat proposé et une taille de 20, lance. Renvoie le nom du candidat. */
async function lancerDuel(page: Page): Promise<string> {
  await page.goto('/');
  // Sur l'accueil, le duel est le second onglet du choix de mode.
  await page.getByRole('tab', { name: /^Duel avec un candidat/ }).click();
  await page.getByRole('button', { name: 'Choisir un candidat' }).click();
  const premier = page.getByRole('list').filter({ hasText: 'propositions' }).first().getByRole('button').first();
  const nom = ((await premier.locator('span.font-semibold').first().textContent()) ?? '').trim();
  await premier.click();
  await page.getByText('20 propositions', { exact: true }).click();
  await page.getByRole('button', { name: /^Lancer le duel/ }).click();
  return nom;
}

async function repondreEtVoir(page: Page): Promise<void> {
  await page.getByRole('button', { name: "Plutôt d'accord" }).first().click();
  await expect(page.locator('[data-revelation]')).toBeVisible();
}

test('duel : la position du candidat est révélée après chaque réponse, sans requête externe', async ({ page }) => {
  test.setTimeout(60_000);
  const externes = surveillerReseau(page);
  const erreurs = surveillerErreurs(page);
  const nom = await lancerDuel(page);
  await expect(page.getByText(`Duel avec`)).toBeVisible();
  await expect(page.locator('main').first()).toContainText(nom);

  for (let i = 0; i < 20; i++) {
    await repondreEtVoir(page);
    if (i >= 8) await expect(page.locator('[data-affinite]')).toContainText('Affinité en direct');
    await page.getByRole('button', { name: /Proposition suivante|Voir mon résultat/ }).click();
  }
  await expect(page.getByText('Résultat du duel')).toBeVisible();
  await expect(page.getByText(/n'est comparable ni à celui d'un duel/)).toBeVisible();
  expect(externes).toEqual([]);
  expect(erreurs).toEqual([]);
});

test('duel : reprise après rechargement, puis « tout effacer » supprime la partie', async ({ page }) => {
  await lancerDuel(page);
  await repondreEtVoir(page);
  await page.reload();
  await page.getByRole('button', { name: /Reprendre le duel/ }).click();
  await expect(page.locator('[data-revelation]')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('isoloir:duel'))).not.toBeNull();
  await page.reload();
  await page.getByRole('button', { name: /Tout effacer/ }).click();
  expect(await page.evaluate(() => localStorage.getItem('isoloir:duel'))).toBeNull();
});

test('duel : la barre « SUJET » affiche la position réelle et progresse, sans violation d\'accessibilité', async ({ page }) => {
  await lancerDuel(page);
  const barre = page.getByRole('progressbar', { name: 'Progression du duel' });
  await expect(page.getByText('SUJET 01 / 20')).toBeVisible();
  await expect(barre).toHaveAttribute('max', '20');
  await expect(barre).toHaveAttribute('value', '0');
  // Pas de bouton « Passer » dans le duel.
  await expect(page.getByRole('button', { name: 'Passer la question' })).toHaveCount(0);
  const axe = async (nom: string) => {
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(r.violations.map((v) => `${nom} : ${v.id} (${v.nodes.length})`), nom).toEqual([]);
  };
  await axe('duel (question)');
  await repondreEtVoir(page);
  await expect(barre).toHaveAttribute('value', '1');
  await axe('duel (révélation)');
  await page.getByRole('button', { name: 'Proposition suivante →' }).click();
  await expect(page.getByText('SUJET 02 / 20')).toBeVisible();
  await expect(barre).toHaveAttribute('value', '1');
});
