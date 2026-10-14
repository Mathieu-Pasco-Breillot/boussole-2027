import { expect, test } from '@playwright/test';

// Compte à rebours et encart « calendrier de l'élection » de l'accueil. L'horloge du navigateur est pilotée par `page.clock`.

const TITRE_PREMIER_TOUR = "1er tour de l'élection présidentielle de 2027";

test('le compte à rebours est tout en haut, avant le h1, et avance', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-04-18T05:59:00Z') });
  await page.goto('/');
  // On fige l'horloge à 10 s de la cible : le temps de chargement de la page ne fausse pas le décompte.
  await page.clock.pauseAt(new Date('2027-04-18T05:59:50Z'));
  const widget = page.getByTestId('compte-a-rebours');
  await expect(widget).toBeVisible();
  await expect(widget.getByText(TITRE_PREMIER_TOUR, { exact: true })).toBeVisible();
  await expect(widget.locator('sup', { hasText: 'er' })).toHaveText('er');
  await expect(widget).toContainText('Premier tour le dimanche 18 avril 2027');
  await expect(widget).toContainText("jusqu'à l'ouverture des bureaux de vote, à 8 h (heure de Paris)");
  await expect(widget.getByRole('heading')).toHaveCount(0);

  // Avant le h1 : dans l'ordre du DOM comme à l'écran.
  const h1 = page.getByRole('heading', { level: 1 });
  const [boite, boiteH1] = [await widget.boundingBox(), await h1.boundingBox()];
  expect(boite!.y + boite!.height).toBeLessThanOrEqual(boiteH1!.y);
  expect(await widget.evaluate((el) => el.closest('main')!.firstElementChild === el)).toBe(true);
  expect(await page.getByRole('heading').first().innerText()).toBe(await h1.innerText());

  const secondes = page.getByTestId('decompte-secondes');
  await expect(secondes).toHaveText('10');
  await page.clock.fastForward(4000);
  await expect(secondes).toHaveText('6');
  // Le décompte n'est pas annoncé aux lecteurs d'écran : chiffres masqués, aucune région live.
  await expect(page.getByTestId('decompte')).toHaveAttribute('aria-hidden', 'true');
  await expect(widget.locator('[aria-live]')).toHaveCount(0);
});

test("l'encart garde ses quatre dates, juste après le haut de page", async ({ page }) => {
  await page.clock.install({ time: new Date('2027-03-01T10:00:00Z') });
  await page.goto('/');
  const encart = page.getByTestId('calendrier');
  await expect(encart.getByRole('heading', { level: 2, name: "Calendrier de l'élection" })).toBeVisible();
  await expect(encart.getByRole('listitem')).toHaveCount(4);
  await expect(encart).toContainText('12 mars 2027, 18 h');
  await expect(encart.getByText('officiel', { exact: true })).toHaveCount(2);
  await expect(encart.getByText("calculé d'après la loi, à confirmer")).toHaveCount(2);
  // Après le haut de page (h1), pas avant le compte à rebours.
  const [h1, e] = [await page.getByRole('heading', { level: 1 }).boundingBox(), await encart.boundingBox()];
  expect(e!.y).toBeGreaterThan(h1!.y);
});

test('sur desktop, les quatre dates sont sur deux colonnes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const lignes = page.getByTestId('calendrier').getByRole('listitem');
  await expect(lignes).toHaveCount(4);
  const [a, b, c, d] = await Promise.all([0, 1, 2, 3].map((i) => lignes.nth(i).boundingBox()));
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
  expect(b!.x).toBeGreaterThan(a!.x + 100);
  expect(c!.x).toBe(a!.x);
  expect(c!.y).toBeGreaterThan(a!.y + 20);
  expect(d!.x).toBe(b!.x);
  expect(Math.abs(c!.y - d!.y)).toBeLessThan(2);
});

test('sur mobile, les quatre dates sont sur une seule colonne', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const lignes = page.getByTestId('calendrier').getByRole('listitem');
  await expect(lignes).toHaveCount(4);
  const boites = await Promise.all([0, 1, 2, 3].map((i) => lignes.nth(i).boundingBox()));
  for (const [i, boite] of boites.entries()) {
    expect(boite!.x).toBe(boites[0]!.x);
    if (i > 0) expect(boite!.y).toBeGreaterThan(boites[i - 1]!.y);
  }
});

test('après le 1er tour, le titre et le décompte visent le 2nd tour', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-04-20T05:00:00Z') });
  await page.goto('/');
  const widget = page.getByTestId('compte-a-rebours');
  await expect(widget.getByText("2nd tour de l'élection présidentielle de 2027", { exact: true })).toBeVisible();
  await expect(widget).toContainText('Second tour le dimanche 2 mai 2027');
  await expect(page.getByTestId('decompte-jours')).toHaveText('12');
});

test('après le 2nd tour, le compte à rebours et l\'encart sont absents', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-05-03T00:00:00Z') });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('compte-a-rebours')).toHaveCount(0);
  await expect(page.getByTestId('calendrier')).toHaveCount(0);
});
