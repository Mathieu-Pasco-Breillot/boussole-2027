import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('encart Impact : ouverture, contenu, accessibilité', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Express ·/ }).click();
  await page.getByRole('button', { name: /^Lancer la partie/ }).click();

  // Toutes les propositions n'ont pas encore d'encart Impact : on avance jusqu'à la première qui en a un.
  const impact = page.getByRole('button', { name: /^Impact/ });
  for (let i = 0; i < 19 && (await impact.count()) === 0; i++) {
    const avant = await page.getByRole('heading', { level: 1 }).first().innerText();
    await page.getByRole('button', { name: "Plutôt d'accord" }).first().click();
    await expect(page.getByRole('heading', { level: 1 }).first()).not.toHaveText(avant);
  }
  await expect(impact).toHaveAttribute('aria-expanded', 'false');
  await impact.click();
  await expect(impact).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('heading', { name: 'Ce que ça changerait' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ce qui fait débat' })).toBeVisible();

  // Un seul encart ouvert à la fois (seulement si la proposition tirée a une Précision : certaines n'en ont pas).
  const precision = page.getByRole('button', { name: /^Précision/ });
  if ((await precision.count()) > 0) {
    await precision.click();
    await expect(page.getByRole('heading', { name: 'Ce que ça changerait' })).toBeHidden();
    await impact.click();
  }
  await page.getByText(/^Sources \(\d+\)/).click();

  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);
  await page.screenshot({ path: info.outputPath(`impact.png`), fullPage: true });

  // L'encart se referme à la proposition suivante.
  await page.getByRole('button', { name: "Plutôt d'accord" }).first().click();
  await expect(page.getByRole('button', { name: /^Impact/ })).toHaveAttribute('aria-expanded', 'false');
});
