import { test, expect } from '@playwright/test';

test('entradas acontecem uma vez e continuam funcionando após navegação', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.showcase-card').first();
  await expect(card).toHaveAttribute('data-motion', 'pending');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute('data-motion', 'revealed');
  await expect(card).toHaveCSS('opacity', '1');
  await expect.poll(() => card.evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(card).toHaveAttribute('data-motion', 'revealed');
  await page.locator('.hero .button').click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(page.locator('.product-card').first()).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('mergulho');
  await expect(page.locator('.hero-photo')).toHaveCSS('opacity', '1');
});

test('foco de teclado revela conteúdo sem esperar a animação', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.showcase-card').first();
  await expect(card).toHaveAttribute('data-motion', 'pending');
  await card.evaluate((element) => element.focus({ preventScroll: true }));
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('opacity', '1');
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0);
});

test('movimento reduzido funciona no carregamento e ao mudar a preferência', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.showcase-card').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-motion="pending"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.showcase-card').first()).toHaveAttribute('data-motion', 'pending');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-motion="pending"]')).toHaveCount(0);
  await expect(page.locator('.showcase-card').first()).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('conteúdo permanece legível sem JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(baseURL);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('mergulho');
    await expect(page.locator('.showcase-card').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-motion="pending"]')).toHaveCount(0);
    await expect(page.locator('.product-carousel .product-card')).toHaveCount(12);
  } finally {
    await context.close();
  }
});

test('menu móvel fecha por Escape e não mantém links ocultos no foco', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  const menu = page.locator('#mobile-navigation');
  const firstLink = menu.getByRole('link', { includeHidden: true }).first();
  await expect(menu).toHaveAttribute('inert', '');
  await firstLink.evaluate((el) => el.focus());
  await expect(firstLink).not.toBeFocused();
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(menu).toHaveCSS('opacity', '1');
  await firstLink.focus();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-hidden', 'true');
  await expect(menu).toHaveCSS('visibility', 'hidden');
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
});
