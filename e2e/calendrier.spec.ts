import { expect, test } from '@playwright/test';

// Bandeau « calendrier de l'élection » de l'accueil. L'horloge du navigateur est pilotée par `page.clock`.

test('le bandeau mentionne le 1er tour et le décompte avance', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-04-18T05:59:00Z') });
  await page.goto('/');
  // On fige l'horloge à 10 s de la cible : le temps de chargement de la page ne fausse pas le décompte.
  await page.clock.pauseAt(new Date('2027-04-18T05:59:50Z'));
  const bandeau = page.getByTestId('calendrier');
  await expect(bandeau).toBeVisible();
  await expect(bandeau.getByRole('heading', { level: 2, name: "Calendrier de l'élection" })).toBeVisible();
  await expect(bandeau).toContainText('Premier tour le dimanche 18 avril 2027');
  await expect(bandeau).toContainText('12 mars 2027, 18 h');
  await expect(bandeau.getByText('officiel', { exact: true })).toHaveCount(2);
  await expect(bandeau.getByText("calculé d'après la loi, à confirmer")).toHaveCount(2);

  const secondes = page.getByTestId('decompte-secondes');
  await expect(secondes).toHaveText('10');
  await page.clock.fastForward(4000);
  await expect(secondes).toHaveText('6');
  // Le décompte n'est pas annoncé aux lecteurs d'écran : chiffres masqués, aucune région live.
  await expect(page.getByTestId('decompte')).toHaveAttribute('aria-hidden', 'true');
  await expect(bandeau.locator('[aria-live]')).toHaveCount(0);
});

test('après le 1er tour, le décompte vise le 2nd tour', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-04-20T05:00:00Z') });
  await page.goto('/');
  const bandeau = page.getByTestId('calendrier');
  await expect(bandeau).toContainText('Second tour le dimanche 2 mai 2027');
  await expect(page.getByTestId('decompte-jours')).toHaveText('12');
});

test('après le 2nd tour, le bandeau est absent', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-05-03T00:00:00Z') });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('calendrier')).toHaveCount(0);
});
