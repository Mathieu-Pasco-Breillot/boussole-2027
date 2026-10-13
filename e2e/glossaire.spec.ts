import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { lancer, repondreQuelques } from './outils.ts';

/**
 * Glossaire des sigles (issue #7). Téléphone : projet par défaut (Pixel 7, écran tactile, sans survol) ; feuille du
 * bas modale. Ordinateur : 1280 × 800, sans écran tactile, avec survol ; bulle et panneau latéral.
 * Pas de `document` ni de `matchMedia` dans une fonction passée à page.evaluate (tsconfig.node.json sans DOM) :
 * expression en chaîne, comme theme.spec.ts.
 */

const ORDINATEUR = { viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false };

async function verifierAxe(page: Page, nom: string): Promise<void> {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(r.violations.map((v) => `${nom} : ${v.id} (${v.nodes.length})`), nom).toEqual([]);
}

/** Sigles de la liste du glossaire, dans l'ordre affiché. */
async function siglesListes(conteneur: Locator): Promise<string[]> {
  return conteneur.locator('li[id^="glossaire-"]').evaluateAll((els) => els.map((e) => e.id.slice('glossaire-'.length)));
}

/** Banque de questions, chapitre Fiscalité déplié : FIS-015, FIS-019 et FIS-020 contiennent « TVA ». */
async function ouvrirBanqueFiscalite(page: Page): Promise<Locator> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Questions', exact: true }).click();
  await page.locator('summary', { hasText: 'Fiscalité' }).click();
  return page.locator('details[open] .sigle-bouton[data-sigle="TVA"]').first();
}

/** Fiche de Marine Le Pen, tous chapitres dépliés (énoncés et extraits annotés). */
async function ouvrirFicheDepliee(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Candidats', exact: true }).click();
  await page.getByRole('button', { name: /Marine Le Pen/ }).click();
  // all() n'attend pas : attendre que la fiche soit rendue.
  await expect(page.locator('summary').first()).toBeVisible();
  for (const s of await page.locator('summary').all()) await s.click();
}

/** Un sigle cliquable dans un lien, un bouton, un résumé ou une étiquette serait un contrôle imbriqué. */
const IMBRIQUES = 'a .sigle, button .sigle, summary .sigle, label .sigle';

test.describe('bouton Glossaire', () => {
  test('téléphone : le bouton ouvre la feuille, Échap la ferme et rend le focus', async ({ page }) => {
    await page.goto('/');
    // Fermé, le glossaire n'est pas dans la page (parcours.spec.ts y cherche des noms de partis pendant le quiz).
    await expect(page.locator('body')).not.toContainText('Taxe sur la valeur ajoutée');
    const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
    await expect(bouton).toHaveAttribute('aria-expanded', 'false');
    await bouton.tap();
    const feuille = page.getByRole('dialog', { name: 'Glossaire' });
    await expect(feuille).toBeVisible();
    await expect(bouton).toHaveAttribute('aria-expanded', 'true');
    const sigles = await siglesListes(feuille);
    expect(sigles).toContain('TVA');
    expect(sigles).toEqual([...sigles].sort((a, b) => a.localeCompare(b, 'fr')));
    await expect(feuille.locator('[aria-current]')).toHaveCount(0);
    await verifierAxe(page, 'feuille ouverte par le bouton');
    await page.keyboard.press('Escape');
    await expect(feuille).toBeHidden();
    await expect(bouton).toBeFocused();
    await expect(page.locator('body')).not.toContainText('Taxe sur la valeur ajoutée');
  });

  test('téléphone : la feuille se ferme par son bouton et par un tap sur le fond', async ({ page }) => {
    await page.goto('/');
    const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
    const feuille = page.getByRole('dialog', { name: 'Glossaire' });
    await bouton.tap();
    await feuille.getByRole('button', { name: 'Fermer le glossaire' }).tap();
    await expect(feuille).toBeHidden();
    await expect(bouton).toBeFocused();
    await bouton.tap();
    await expect(feuille).toBeVisible();
    // En haut de l'écran, au-dessus de la feuille (85 % de la hauteur au plus) : le fond.
    await page.touchscreen.tap(200, 20);
    await expect(feuille).toBeHidden();
    await expect(bouton).toBeFocused();
  });

  test.describe('ordinateur', () => {
    test.use(ORDINATEUR);

    test('le bouton ouvre le panneau, qui réserve sa largeur, puis le rétracte', async ({ page }) => {
      await page.goto('/');
      const bouton = page.getByRole('button', { name: 'Glossaire', exact: true });
      await bouton.click();
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      await expect(panneau).toBeVisible();
      await expect(bouton).toHaveAttribute('aria-expanded', 'true');
      expect(await siglesListes(panneau)).toContain('TVA');
      // Le contenu, centré, se range à gauche du panneau au lieu de passer dessous.
      const contenu = (await page.locator('main').boundingBox())!;
      const cote = (await panneau.boundingBox())!;
      expect(contenu.x + contenu.width).toBeLessThanOrEqual(cote.x);
      await verifierAxe(page, 'panneau ouvert par le bouton');
      await bouton.click();
      await expect(panneau).toBeHidden();
      await expect(bouton).toHaveAttribute('aria-expanded', 'false');
      await bouton.click();
      await panneau.getByRole('button', { name: 'Fermer le glossaire' }).click();
      await expect(panneau).toBeHidden();
      await expect(bouton).toBeFocused();
    });
  });
});

test.describe('sigles dans les textes', () => {
  test('les textes sont annotés, jamais à l’intérieur d’un contrôle', async ({ page }) => {
    await ouvrirBanqueFiscalite(page);
    await expect(page.locator('details[open] .sigle-bouton[data-sigle="TVA"]')).toHaveCount(3);
    for (const s of await page.locator('summary').all()) await s.click();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);

    await ouvrirFicheDepliee(page);
    await expect(page.locator('.sigle-bouton:visible').first()).toBeVisible();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);

    await page.goto('/');
    await page.getByRole('button', { name: 'Méthode', exact: true }).click();
    for (const onglet of ['Méthodologie', 'Grille de codage', "Critère d'inclusion", 'Journal des modifications']) {
      await page.getByRole('tab', { name: onglet }).click();
      await expect(page.getByRole('tabpanel')).not.toContainText('Chargement…');
      await expect(page.locator(IMBRIQUES), onglet).toHaveCount(0);
    }

    await lancer(page, 'Express');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(IMBRIQUES)).toHaveCount(0);
  });

  test('le nom accessible et le texte d’un énoncé ne changent pas', async ({ page }) => {
    const tva = await ouvrirBanqueFiscalite(page);
    await expect(tva).toHaveAccessibleName('TVA');
    const ligne = page.locator('details[open] li').filter({ has: page.locator('.sigle-bouton[data-sigle="TVA"]') }).first();
    // Le (i) est un pseudo-élément : il n'entre ni dans le texte ni dans le nom accessible.
    await expect(ligne).not.toContainText('TVAi');
    await expect(ligne).toContainText(/FIS-0\d\d · La TVA /);
  });

  test('téléphone : un tap sur un sigle ouvre la feuille sur sa définition', async ({ page }) => {
    const tva = await ouvrirBanqueFiscalite(page);
    await tva.tap();
    const feuille = page.getByRole('dialog', { name: 'Glossaire' });
    await expect(feuille.locator('[data-definition-demandee]')).toContainText('Taxe sur la valeur ajoutée');
    await expect(feuille.locator('#glossaire-TVA')).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(tva).toBeFocused();
  });

  test.describe('ordinateur', () => {
    test.use(ORDINATEUR);

    test('le survol montre la bulle ; le clic ouvre le panneau sur l’entrée', async ({ page }) => {
      const tva = await ouvrirBanqueFiscalite(page);
      await tva.hover();
      const bulle = page.getByRole('tooltip');
      await expect(bulle).toContainText('Taxe sur la valeur ajoutée');
      await expect(tva).toHaveAttribute('aria-describedby', (await bulle.getAttribute('id'))!);
      await tva.click();
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      await expect(panneau.locator('#glossaire-TVA')).toHaveAttribute('aria-current', 'true');
      await expect(tva).toBeFocused();
    });

    test('panneau déjà ouvert : à la fermeture, le focus revient au dernier sigle cliqué, même après un changement d’écran', async ({ page }) => {
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      const fermer = panneau.getByRole('button', { name: 'Fermer le glossaire' });

      // Deux sigles du même écran : le focus revient au second, celui où l'on se trouvait.
      const tva = await ouvrirBanqueFiscalite(page);
      await tva.click();
      await expect(panneau).toBeVisible();
      const autre = page.locator('details[open] .sigle-bouton[data-sigle="TVA"]').nth(2);
      await autre.click();
      await fermer.click();
      await expect(panneau).toBeHidden();
      await expect(autre).toBeFocused();

      // Le sigle d'ouverture disparaît avec l'écran (le panneau, non modal, reste ouvert) : le focus ne se perd pas.
      await tva.click();
      await expect(panneau).toBeVisible();
      await page.getByRole('button', { name: '← Retour' }).click();
      await expect(tva).toHaveCount(0);
      await page.getByRole('button', { name: 'Questions', exact: true }).click();
      await page.locator('summary', { hasText: 'Fiscalité' }).click();
      const apres = page.locator('details[open] .sigle-bouton[data-sigle="TVA"]').first();
      await apres.click();
      await fermer.click();
      await expect(panneau).toBeHidden();
      await expect(apres).toBeFocused();
    });
  });
});

test.describe('bulle, panneau et feuille sur un sigle', () => {
  test('téléphone : (i) à la première occurrence d’un bloc seulement ; tap, feuille, retour du focus', async ({ page }) => {
    await ouvrirFicheDepliee(page);
    // Reformulation de FIS-019 sur la fiche : « TVA » deux fois dans le même paragraphe.
    const bloc = page.locator('[data-extraits] p', { hasText: 'veut instaurer une TVA à 0 %' }).first();
    const tva = bloc.locator('.sigle-bouton[data-sigle="TVA"]');
    expect(await tva.count()).toBeGreaterThanOrEqual(2);
    const contenus = await tva.evaluateAll((els) => els.map((e) => e.ownerDocument.defaultView!.getComputedStyle(e, '::after').content));
    expect(contenus[0]).not.toBe('none');
    expect(contenus.slice(1)).toEqual(contenus.slice(1).map(() => 'none'));

    const feuille = page.getByRole('dialog', { name: 'Glossaire' });
    await tva.nth(1).tap();
    await expect(feuille.locator('[data-definition-demandee]')).toContainText('Taxe sur la valeur ajoutée');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await verifierAxe(page, 'feuille ouverte sur un sigle');
    await page.keyboard.press('Escape');
    await expect(feuille).toBeHidden();
    await expect(tva.nth(1)).toBeFocused();

    await tva.first().tap();
    await feuille.getByRole('button', { name: 'Fermer le glossaire' }).tap();
    await expect(feuille).toBeHidden();
    await expect(tva.first()).toBeFocused();

    await tva.first().tap();
    await expect(feuille).toBeVisible();
    await page.touchscreen.tap(200, 20);
    await expect(feuille).toBeHidden();
    await expect(tva.first()).toBeFocused();
  });

  test.describe('ordinateur', () => {
    test.use(ORDINATEUR);

    test('la bulle : au focus et au survol, survolable, fermée par Échap ; pas de (i)', async ({ page }) => {
      const tva = await ouvrirBanqueFiscalite(page);
      expect(await tva.evaluate((e) => e.ownerDocument.defaultView!.getComputedStyle(e, '::after').content)).toBe('none');
      const bulle = page.getByRole('tooltip');
      await tva.focus();
      await expect(bulle).toContainText('Taxe sur la valeur ajoutée');
      await expect(tva).toHaveAttribute('aria-describedby', (await bulle.getAttribute('id'))!);
      await verifierAxe(page, 'bulle ouverte');
      await page.keyboard.press('Escape');
      await expect(bulle).toHaveCount(0);
      await expect(tva).toBeFocused();
      await expect(tva).not.toHaveAttribute('aria-describedby');
      await tva.blur();
      await page.mouse.move(0, 0);
      await tva.hover();
      await expect(bulle).toBeVisible();
      // WCAG 1.4.13 : le pointeur passe du sigle à la bulle sans la fermer.
      await bulle.hover();
      await expect(bulle).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(bulle).toHaveCount(0);
    });

    test('le clic ouvre le panneau sur l’entrée, l’amène dans la vue, et y revient à chaque clic', async ({ page }) => {
      const tva = await ouvrirBanqueFiscalite(page);
      await tva.click();
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      const entree = panneau.locator('#glossaire-TVA');
      await expect(entree).toHaveAttribute('aria-current', 'true');
      await expect(entree).toBeInViewport();
      await expect(tva).toBeFocused();
      await verifierAxe(page, 'panneau ouvert sur une entrée');
      // Remonter la liste puis recliquer : le défilement repart.
      await panneau.getByRole('region', { name: 'Liste du glossaire' }).hover();
      await page.mouse.wheel(0, -100_000);
      await expect(entree).not.toBeInViewport();
      await tva.click();
      await expect(entree).toBeInViewport();
      // Échap ferme la bulle, pas le panneau (non modal).
      await page.mouse.move(0, 0);
      await tva.hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await expect(panneau).toBeVisible();
      await page.getByRole('button', { name: 'Glossaire', exact: true }).click();
      await expect(panneau).toBeHidden();
    });

    test('panneau ouvert : une bulle qui déborde sur le panneau reste au-dessus de lui', async ({ page }) => {
      // 1024 px : le contenu ne garde que 640 px, une bulle de 20 rem ancrée à droite de la ligne recouvre le panneau.
      await page.setViewportSize({ width: 1024, height: 800 });
      await ouvrirBanqueFiscalite(page);
      await page.getByRole('button', { name: 'Glossaire', exact: true }).click();
      const panneau = page.getByRole('complementary', { name: 'Glossaire' });
      await expect(panneau).toBeVisible();
      const gauchePanneau = (await panneau.boundingBox())!.x;
      const bulle = page.getByRole('tooltip');
      let recouvrante = 0;
      for (const sigle of await page.locator('details[open] .sigle-bouton:visible').all()) {
        await page.mouse.move(0, 0);
        await sigle.hover();
        await expect(bulle).toBeVisible();
        const b = (await bulle.boundingBox())!;
        if (b.x + b.width <= gauchePanneau + 1) continue;
        recouvrante += 1;
        // Un point de la bulle dans la zone du panneau : c'est la bulle qui est dessus, pas le panneau.
        const point = { x: (Math.max(b.x, gauchePanneau) + b.x + b.width) / 2, y: b.y + b.height / 2 };
        expect(await bulle.evaluate((e, p) => e.ownerDocument.elementFromPoint(p.x, p.y)?.closest('[role="tooltip"]') !== null, point)).toBe(true);
      }
      expect(recouvrante, 'au moins une bulle recouvre le panneau').toBeGreaterThan(0);
    });

    test.describe('animations permises', () => {
      test.use({ reducedMotion: 'no-preference' });

      test('le défilement doux amène aussi l’entrée dans la vue', async ({ page }) => {
        const tva = await ouvrirBanqueFiscalite(page);
        await tva.click();
        await expect(page.getByRole('complementary', { name: 'Glossaire' }).locator('#glossaire-TVA')).toBeInViewport();
      });
    });
  });
});

test.describe('bulle dans le titre d’une question', () => {
  // 360 px avec survol : le pire cas pour une bulle de 20 rem ancrée à gauche du sigle.
  test.use({ viewport: { width: 360, height: 780 }, isMobile: false, hasTouch: false });

  test('la bulle ne déborde pas de l’écran et ne casse pas l’accessibilité', async ({ page }) => {
    test.setTimeout(120_000);
    await lancer(page, 'Ultra');
    const sigle = page.getByRole('heading', { level: 1 }).first().locator('.sigle-bouton');
    // Une question sur dix environ contient un sigle : on avance jusqu'à en trouver une.
    for (let i = 0; i < 100 && (await sigle.count()) === 0; i++) await repondreQuelques(page, 1);
    expect(await sigle.count(), 'aucune question à sigle trouvée').toBeGreaterThan(0);
    for (const s of await sigle.all()) {
      await s.focus();
      const bulle = page.getByRole('tooltip');
      await expect(bulle).toBeVisible();
      const b = (await bulle.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(360);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(await page.evaluate('document.documentElement.scrollWidth')).toBeLessThanOrEqual(360);
      await verifierAxe(page, 'bulle dans le titre h1');
      await page.keyboard.press('Escape');
      await expect(bulle).toHaveCount(0);
    }
  });
});

test.describe('un seul (i) par sigle et par bloc de texte', () => {
  test('documents Markdown : jamais deux (i) pour un même sigle dans un paragraphe, une cellule ou un item', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Méthode', exact: true }).click();
    let sigles = 0;
    for (const onglet of ['Méthodologie', 'Grille de codage', "Critère d'inclusion", 'Journal des modifications']) {
      await page.getByRole('tab', { name: onglet }).click();
      await expect(page.getByRole('tabpanel')).not.toContainText('Chargement…');
      // Un bloc = le plus proche paragraphe, item, cellule, titre ou citation ; gras et italique n'en font pas un autre.
      const marques = await page
        .getByRole('tabpanel')
        .locator('.sigle-bouton')
        .evaluateAll((els) =>
          els.map((e) => ({
            sigle: e.getAttribute('data-sigle')!,
            premiere: e.hasAttribute('data-premiere'),
            bloc: [...e.ownerDocument.querySelectorAll('p, li, td, th, h2, h3, blockquote')].indexOf(e.closest('p, li, td, th, h2, h3, blockquote')!),
          })),
        );
      sigles += marques.length;
      const parBloc = new Map<string, number>();
      for (const m of marques) if (m.premiere) parBloc.set(`${m.bloc}/${m.sigle}`, (parBloc.get(`${m.bloc}/${m.sigle}`) ?? 0) + 1);
      expect([...parBloc].filter(([, n]) => n > 1).map(([k]) => `${onglet} : ${k}`)).toEqual([]);
    }
    // Le test ne vaut que si les documents contiennent des sigles.
    expect(sigles).toBeGreaterThan(0);
  });
});
