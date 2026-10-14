import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Accueil, en-tête et dialogue « À propos », repris de la maquette V0 (issue #17, lot 2).
// Pas de `document` dans une fonction passée à page.evaluate (tsconfig.node.json sans DOM) : expression en chaîne.

const ORDINATEUR = { viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false };
const TELEPHONE = { viewport: { width: 390, height: 844 } };
const RUBRIQUES = ['Accueil', 'Le quiz', 'Le duel', 'Notre méthode'];

const ANIMATION_SCEAU = `getComputedStyle(document.querySelector('[data-sceau]')).animationName`;
const navigation = (page: Page) => page.getByRole('navigation', { name: 'Navigation principale' });

test('haut de page : textes de la maquette, trois étapes et cartes de mode', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Et si vous faisiez le point avant 2027\s?\?$/);
  await expect(page.getByRole('button', { name: 'Trouver mes affinités' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Duel avec un candidat', exact: true })).toBeVisible();
  await expect(page.getByText('Pas de bonne réponse. Pas de consigne de vote.')).toBeVisible();
  for (const etape of ['Vous répondez.', 'On compare.', 'Vous explorez.']) await expect(page.getByText(etape, { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Deux façons de vous situer.' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Le quiz\s*À votre rythme, de 20 à 200 questions\./ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Le duel\s*Une question, un candidat, une source\./ })).toBeVisible();
  // Contenu de démonstration de la maquette : jamais porté.
  await expect(page.locator('body')).not.toContainText(/fictif|simulé|démonstration d.affinité/i);
});

test('« Trouver mes affinités » mène au choix du format ; « Duel avec un candidat » au choix du candidat', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Trouver mes affinités' }).click();
  await expect(page.getByRole('button', { name: /^Express ·/ })).toBeInViewport();
  await page.getByRole('button', { name: 'Duel avec un candidat', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Duel avec un candidat' })).toBeVisible();
});

test('les cartes de mode : le quiz mène aux formats, le duel au choix du candidat', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Le quiz\s*À votre rythme/ }).click();
  await expect(page.getByRole('button', { name: /^Express ·/ })).toBeInViewport();
  await page.getByRole('button', { name: /^Le duel\s*Une question/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Duel avec un candidat' })).toBeVisible();
});

test('sceau en CSS pur, immobile quand les animations sont réduites ; tricolore en surtitre', async ({ page }) => {
  await page.goto('/');
  const sceau = page.locator('[data-sceau]');
  await expect(sceau).toBeVisible();
  await expect(sceau).toContainText('2027');
  await expect(sceau.locator('img, svg, picture, canvas')).toHaveCount(0);
  expect(await page.evaluate(`getComputedStyle(document.querySelector('[data-sceau]')).backgroundImage`)).toBe('none');
  expect(await page.evaluate(ANIMATION_SCEAU)).toBe('none');
  // Aucune image dans le haut de page (CSP img-src 'self' data:, rien de distant).
  await expect(page.locator('main section').first().locator('img')).toHaveCount(0);
  await expect(page.locator('main .tricolore').first()).toBeVisible();
  // Plus de bandeau fixe : le filet tricolore du haut défile avec la page, comme dans la maquette.
  expect(await page.evaluate(`getComputedStyle(document.body, '::before').position`)).not.toBe('fixed');
});

test.describe('animations permises', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('le sceau tourne', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(ANIMATION_SCEAU)).not.toBe('none');
  });
});

for (const [nom, appareil] of [
  ['téléphone 390 px', TELEPHONE],
  ['ordinateur 1280 px', ORDINATEUR],
] as const) {
  test.describe(nom, () => {
    test.use(appareil);

    test('en-tête : quatre rubriques et « À propos », sans défilement horizontal', async ({ page }) => {
      await page.goto('/');
      const nav = navigation(page);
      await expect(nav.getByRole('button')).toHaveText(RUBRIQUES);
      for (const r of RUBRIQUES) await expect(nav.getByRole('button', { name: r, exact: true })).toBeInViewport();
      await expect(page.getByRole('button', { name: 'À propos', exact: true })).toBeInViewport();
      await expect(nav.getByRole('button', { name: 'Accueil', exact: true })).toHaveAttribute('aria-current', 'page');
      expect(await page.evaluate(`document.documentElement.scrollWidth`)).toBeLessThanOrEqual(appareil.viewport.width);
    });

    test('dialogue « À propos » : focus piégé, Échap et bouton le ferment, le focus revient', async ({ page }) => {
      await page.goto('/');
      const bouton = page.getByRole('button', { name: 'À propos', exact: true });
      await bouton.click();
      const dialogue = page.getByRole('dialog', { name: 'Vos idées, pas notre avis.' });
      await expect(dialogue).toBeVisible();
      await expect(dialogue).toContainText('ne recommande aucun vote');
      await expect(dialogue).toContainText(/source publique/);
      await expect(dialogue).toContainText(/aucune réponse n.est envoyée/);
      const dedans = `!!document.activeElement && !!document.activeElement.closest('dialog')`;
      expect(await page.evaluate(dedans)).toBe(true);
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        expect(await page.evaluate(dedans), `tabulation ${i + 1}`).toBe(true);
      }
      await page.keyboard.press('Shift+Tab');
      expect(await page.evaluate(dedans)).toBe(true);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(r.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(dialogue).toHaveCount(0);
      await expect(bouton).toBeFocused();

      await bouton.click();
      await page.getByRole('button', { name: 'J’ai compris' }).click();
      await expect(dialogue).toHaveCount(0);
      await expect(bouton).toBeFocused();
      await bouton.click();
      await dialogue.getByRole('button', { name: 'Fermer' }).click();
      await expect(dialogue).toHaveCount(0);
      await expect(bouton).toBeFocused();
    });
  });
}

test('rubriques : « Le duel » ouvre le choix du candidat, « Notre méthode » la méthode', async ({ page }) => {
  await page.goto('/');
  await navigation(page).getByRole('button', { name: 'Le duel', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Duel avec un candidat' })).toBeVisible();
  await page.goto('/');
  await navigation(page).getByRole('button', { name: 'Notre méthode', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Méthode' })).toBeVisible();
  await expect(navigation(page).getByRole('button', { name: 'Notre méthode', exact: true })).toHaveAttribute('aria-current', 'page');
  await navigation(page).getByRole('button', { name: 'Le quiz', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Express ·/ })).toBeInViewport();
});

test('rubriques secondaires dans le pied de page : candidats, questions, vie privée, versions, réglages', async ({ page }) => {
  await page.goto('/');
  const pied = page.getByRole('contentinfo');
  await expect(pied.getByTestId('versions')).toBeVisible();
  await expect(page.getByRole('button', { name: /Effets sonores/ })).toBeVisible();
  await pied.getByRole('button', { name: 'Candidats', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Candidats' })).toBeVisible();
  await expect(page.getByRole('contentinfo').getByRole('button', { name: 'Candidats', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('contentinfo').getByRole('button', { name: 'Questions', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Banque de questions' })).toBeVisible();
  await page.getByRole('contentinfo').getByRole('button', { name: 'Vie privée', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Vie privée' })).toBeVisible();
});
