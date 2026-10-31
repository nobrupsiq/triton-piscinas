import { test, expect } from '@playwright/test';

test('galeria amplia na mesma página e permite navegar e fechar', async ({
  page,
  context,
}, testInfo) => {
  await page.goto('/projetos/solares-clube');
  const trigger = page.getByRole('button', {
    name: 'Ampliar foto 1 do projeto Solares Clube',
    exact: true,
  });
  const source = await trigger.locator('img').getAttribute('src');
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Solares Clube' });
  const photo = dialog.locator('img');
  await expect(dialog).toBeVisible();
  await expect(photo).toHaveAttribute('src', source);
  await expect(dialog.getByRole('button', { name: 'Fechar galeria' })).toBeFocused();
  expect(context.pages()).toHaveLength(1);
  await expect(page).toHaveURL(/\/projetos\/solares-clube$/);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe('hidden');
  await photo.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Próxima foto' }).click();
  await expect(photo).toHaveAttribute('alt', 'Registro 2 do projeto Solares Clube');
  await page.keyboard.press('ArrowLeft');
  await expect(photo).toHaveAttribute('src', source);
  await page.keyboard.press('ArrowLeft');
  const count = await page.locator('.project-photo').count();
  await expect(photo).toHaveAttribute('alt', `Registro ${count} do projeto Solares Clube`);
  await page.keyboard.press('ArrowRight');
  await expect(photo).toHaveAttribute('src', source);
  await expect
    .poll(() => photo.evaluate((image) => image.complete && image.naturalWidth > 0))
    .toBe(true);
  const bounds = await photo.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
  await page.screenshot({ path: `preview/galeria-${testInfo.project.name}.png` });
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).not.toBeVisible();
  await trigger.click();
  await dialog.getByRole('button', { name: 'Fechar galeria' }).click();
  await expect(dialog).not.toBeVisible();
});

test('galeria preserva as legendas e os créditos do projeto', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projetos/vasco-da-gama');
  const figure = page
    .locator('.project-gallery > figure')
    .filter({ hasText: 'Foto: Paulo Fernandes' })
    .first();
  const caption = await figure.locator('figcaption').textContent();
  await figure.getByRole('button').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('figcaption')).toHaveText(caption);
  expect(await dialog.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await dialog.getByRole('button', { name: 'Fechar galeria' }).click();
  await expect(dialog).not.toBeVisible();
});
