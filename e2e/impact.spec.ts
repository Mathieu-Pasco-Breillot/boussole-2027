import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AUTRES = ['Retraites', 'Fiscalité', 'Économie et dette', 'Santé', 'Éducation', 'Immigration', 'Sécurité', 'Défense', 'Union européenne', 'Écologie et énergie'];

for (const theme of ['dark', 'light'] as const) {
  test(`encart Impact : ouverture, contenu, accessibilité (thème ${theme === 'dark' ? 'sombre' : 'clair'})`, async ({ page }, info) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    await page.getByRole('button', { name: /^Express ·/ }).click();
    for (const t of AUTRES) await page.getByRole('radiogroup', { name: `Importance du thème ${t}` }).getByText('Écarter').click();
    await page.getByRole('button', { name: /^Lancer la partie/ }).click();

    const impact = page.getByRole('button', { name: /^Impact/ });
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
    await page.screenshot({ path: info.outputPath(`impact-${theme}.png`), fullPage: true });

    // L'encart se referme à la proposition suivante.
    await page.getByRole('button', { name: "Plutôt d'accord" }).first().click();
    await expect(page.getByRole('button', { name: /^Impact/ })).toHaveAttribute('aria-expanded', 'false');
  });
}
