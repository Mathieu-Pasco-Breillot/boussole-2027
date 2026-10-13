import { expect, test } from '@playwright/test';
import { lancer, repondreATout, repondreQuelques, surveillerErreurs, surveillerReseau } from './outils.ts';

const MODES = [
  ['Express', 20],
  ['Débat', 40],
  ['Campagne', 60],
  ['Semi-marathon', 100],
  ['Marathon', 150],
  ['Ultra', 200],
] as const;

for (const [mode, n] of MODES) {
  test(`parcours complet en mode ${mode}, sans aucune requête externe`, async ({ page }) => {
    // Environ une seconde par question, pour que les modes longs (jusqu'à 200 questions) aient le temps de finir.
    test.setTimeout(Math.max(30_000, n * 1_000));
    const externes = surveillerReseau(page);
    const erreurs = surveillerErreurs(page);
    await lancer(page, mode);
    // Aucun nom de candidat ni de parti pendant le quiz (spécification § 6).
    await expect(page.locator('body')).not.toContainText(/Le Pen|Mélenchon|Philippe|Retailleau|Rassemblement national/);
    await repondreATout(page, n);
    await expect(page.getByText(`sur ${n} questions`)).toBeVisible();
    expect(externes).toEqual([]);
    expect(erreurs).toEqual([]);
  });
}

test('le défi « Qui a dit ça ? » se joue de bout en bout', async ({ page }) => {
  const externes = surveillerReseau(page);
  await page.goto('/');
  await page.getByRole('button', { name: /Défi/ }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole('list', { name: 'Candidats proposés' }).getByRole('button').first().click();
    await page.getByRole('button', { name: /Manche suivante|Voir le total/ }).click();
  }
  await expect(page.getByRole('status')).toContainText(/sur 5/);
  expect(externes).toEqual([]);
});

test("une partie interrompue est reprise là où elle s'est arrêtée", async ({ page }) => {
  await lancer(page, 'Express');
  await repondreQuelques(page, 3);
  await expect(page.getByText('4 / 20')).toBeVisible();
  const avant = await page.getByRole('heading', { level: 1 }).first().innerText();
  await page.reload();
  await page.getByRole('button', { name: /Reprendre la partie/ }).click();
  await expect(page.getByText('4 / 20')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(avant);
});

test('la carte de résultat se télécharge sans requête externe', async ({ page }) => {
  const externes = surveillerReseau(page);
  await lancer(page, 'Campagne');
  await repondreATout(page, 60);
  const [telechargement] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Partager ou télécharger/ }).click(),
  ]);
  expect(telechargement.suggestedFilename()).toBe('mon-isoloir.png');
  expect(externes).toEqual([]);
});

test('« tout effacer » supprime la partie enregistrée', async ({ page }) => {
  await lancer(page, 'Express');
  await repondreQuelques(page, 1);
  await page.goto('/');
  await page.getByRole('button', { name: 'Vie privée' }).click();
  await page.getByRole('button', { name: 'Tout effacer sur cet appareil' }).click();
  await expect(page.getByRole('button', { name: /Reprendre la partie/ })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('isoloir:partie'))).toBeNull();
});

test('les badges : Campagne terminée, puis « tout effacer » les retire', async ({ page }) => {
  await lancer(page, 'Campagne');
  await repondreATout(page, 60);
  await page.getByRole('button', { name: "Passer l'animation" }).click({ timeout: 1000 }).catch(() => undefined);
  const campagne = page.getByRole('listitem').filter({ hasText: 'Partie Campagne terminée' });
  await expect(campagne).toContainText('(obtenu)');
  await page.getByRole('button', { name: 'Vie privée' }).click();
  await page.getByRole('button', { name: 'Tout effacer sur cet appareil' }).click();
  expect(await page.evaluate(() => localStorage.getItem('isoloir:badges'))).toBeNull();
});

test("le quiz s'enchaîne sans écran intermédiaire : le thème est rappelé au-dessus de chaque proposition", async ({ page }) => {
  await lancer(page, 'Express');
  const themes = new Set<string>();
  for (let i = 1; i <= 19; i++) {
    await expect(page.getByText(`${i} / 20`)).toBeVisible();
    themes.add(await page.getByTestId('theme').innerText());
    const avant = await page.getByRole('heading', { level: 1 }).first().innerText();
    await page.getByRole('button', { name: "Plutôt d'accord" }).first().click();
    // Une réponse mène tout droit à la proposition suivante, y compris au changement de thème.
    await expect(page.getByText(`${i + 1} / 20`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 }).first()).not.toHaveText(avant);
  }
  expect(themes.size).toBeGreaterThan(1);
  await expect(page.locator('main')).not.toContainText(/Chapitre/);
});

test('préparation : un chapitre écarté (poids 0) n’est pas posé, et le nombre de questions annoncé est tenu', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Campagne ·/ }).click();
  await page.getByRole('radiogroup', { name: 'Importance du thème Retraites' }).getByText('Écarter').click();
  // Ne garder qu'un seul autre chapitre : moins de 60 questions disponibles.
  for (const t of ['Fiscalité', 'Économie et dette', 'Santé', 'Éducation', 'Immigration', 'Sécurité', 'Défense', 'Union européenne', 'Institutions']) {
    await page.getByRole('radiogroup', { name: `Importance du thème ${t}` }).getByText('Écarter').click();
  }
  const statut = page.locator('[data-questions-disponibles]');
  const dispo = Number(await statut.getAttribute('data-questions-disponibles'));
  expect(dispo).toBeGreaterThan(0);
  expect(dispo).toBeLessThan(60);
  await expect(statut).toContainText(`La partie comptera ${dispo} questions au lieu de 60`);
  await page.getByRole('button', { name: `Lancer la partie (${dispo} questions)` }).click();
  await expect(page.getByTestId('theme')).toHaveText('Écologie et énergie');
  await expect(page.getByText(`1 / ${dispo}`)).toBeVisible();
});
