import { test, expect } from '@playwright/test';

test('soltar o arraste alinha gradualmente, sem salto entre frames', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const rail = page.locator('.carousel-rail');
  await rail.scrollIntoViewIfNeeded();
  await expect(page.locator('.product-carousel')).toHaveCSS('opacity', '1');
  const box = await rail.locator('img').first().boundingBox();
  const x = box.x + box.width * 0.85;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 120, y, { steps: 12 });
  await rail.evaluate((el) => {
    window.dragSamples = [el.scrollLeft];
    window.dragDone = false;
    function sample() {
      window.dragSamples.push(el.scrollLeft);
      if (el.dataset.dragging || el.dataset.settling) requestAnimationFrame(sample);
      else window.dragDone = true;
    }
    requestAnimationFrame(sample);
  });
  await page.mouse.up();
  await page.waitForFunction(() => window.dragDone);
  const samples = await page.evaluate(() => window.dragSamples);
  expect(new Set(samples.map(Math.round)).size).toBeGreaterThan(5);
  expect(Math.max(...samples.slice(1).map((v, i) => Math.abs(v - samples[i])))).toBeLessThan(50);
  await expect(rail).toHaveCSS('scroll-snap-type', 'x mandatory');
  await expect(page).toHaveURL(/\/$/);
});

test('arrastar com mouse move os cards sem abrir produto e preserva clique normal', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const rail = page.locator('.carousel-rail');
  await rail.scrollIntoViewIfNeeded();
  const image = rail.locator('img').first();
  const box = await image.boundingBox();
  const x = box.x + box.width * 0.85;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 220, y, { steps: 12 });
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(150);
  await page.mouse.up();
  await expect(page).toHaveURL(/\/$/);
  await expect(rail).not.toHaveAttribute('data-dragging');
  await expect(rail).toHaveCSS('scroll-snap-type', 'x mandatory');
  // Capture must also release when the mouse ends outside the carousel.
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 8 });
  await page.mouse.move(2, 5, { steps: 8 });
  await page.mouse.up();
  await expect(rail).not.toHaveAttribute('data-dragging');
  await rail.focus();
  await page.keyboard.press('Home');
  await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeLessThan(2);
  const link = rail.locator('.featured-card-link').first();
  const href = await link.getAttribute('href');
  await link.click();
  await expect(page).toHaveURL(new RegExp(href + '$'));
});

test('vitrine navega por setas e teclado, respeitando os limites', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Produtos em destaque' });
  const rail = carousel.locator('.carousel-rail');
  const previous = carousel.getByRole('button', { name: 'Produtos anteriores' });
  const next = carousel.getByRole('button', { name: 'Próximos produtos' });
  await expect(carousel.locator('.featured-card')).toHaveCount(12);
  await carousel.scrollIntoViewIfNeeded();
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await next.click();
  await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
  await expect(previous).toBeEnabled();
  await rail.focus();
  await page.keyboard.press('End');
  await expect(next).toBeDisabled();
  await expect(carousel.locator('.carousel-counter')).toContainText('12');
  await page.keyboard.press('Home');
  await expect(previous).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expect(previous).toBeEnabled();
  await page.keyboard.press('Home');
  await expect(previous).toBeDisabled();
  const first = carousel.locator('.featured-card-link').first();
  const href = await first.getAttribute('href');
  await first.click();
  await expect(page).toHaveURL(new RegExp(href + '$'));
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sol');
});

test('vitrine mantém o layout responsivo e exibe imagens reais', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const carousel = page.locator('.product-carousel');
  await carousel.scrollIntoViewIfNeeded();
  await carousel.locator('img').evaluateAll((images) =>
    images.forEach((image) => {
      image.loading = 'eager';
    }),
  );
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.product-carousel img')].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const layout = await carousel.locator('.carousel-rail').evaluate((rail) => ({
    content: rail.scrollWidth,
    viewport: rail.clientWidth,
    snap: getComputedStyle(rail).scrollSnapType,
  }));
  expect(layout.content).toBeGreaterThan(layout.viewport);
  expect(layout.snap).toBe('x mandatory');
  await page
    .locator('.featured-section')
    .screenshot({ path: `preview/carrossel-${testInfo.project.name}.png`, scale: 'css' });
});
