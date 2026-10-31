import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('home: fontes locais, imagens locais e layout sem rolagem horizontal', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('mergulho');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluateAll((images) =>
    images.forEach((image) => {
      image.loading = 'eager';
    }),
  );
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    heading: getComputedStyle(document.querySelector('h1')).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
    loadedFonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
    externalImages: [...document.images].filter((image) => image.src.includes('wp-content')).length,
  }));
  expect(result.overflow).toBe(false);
  expect(result.heading.toLowerCase()).toContain('bogue');
  expect(result.body.toLowerCase()).toContain('lexend');
  expect(result.loadedFonts.length).toBeGreaterThanOrEqual(2);
  expect(result.externalImages).toBe(0);
  expect(errors).toEqual([]);
  await fs.mkdir('preview', { recursive: true });
  // Full-page captures should show content that normally enters on scrolling.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({
    path: `preview/inicio-${testInfo.project.name}.png`,
    fullPage: true,
    scale: 'css',
  });
});

test('busca, categorias, paginação e estado vazio', async ({ page }) => {
  await page.goto('/produtos');
  await expect(page.locator('.results-heading')).toContainText('401');
  await expect(page.locator('.product-card')).toHaveCount(16);
  await page.getByRole('link', { name: 'Próxima página' }).click();
  await expect(page).toHaveURL(/pagina=2/);
  await page.getByRole('searchbox').fill('sol');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.locator('.results-heading')).toContainText('para “sol”');
  expect(page.url()).not.toContain('pagina=2');
  await page
    .getByRole('navigation', { name: 'Categorias de produtos' })
    .getByRole('link', { name: 'Spas', exact: true })
    .click();
  await expect(page).toHaveURL(/categoria=spas/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('searchbox').fill('zzzinexistentezzz');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vamos tentar de outro jeito?' })).toBeVisible();
  await page.getByRole('link', { name: 'Limpar filtros' }).click();
  await expect(page.locator('.results-heading')).toContainText('401');
});

test('produto: galeria e orçamento com a variação correta', async ({ page }, testInfo) => {
  await page.goto('/produtos/spas-de-hidromassagem-sol-albacete-1129');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sol');
  const initialImage = await page.locator('.gallery-main img').getAttribute('src');
  await page.getByRole('button', { name: 'Ver imagem 2' }).click();
  await expect(page.locator('.gallery-main img')).not.toHaveAttribute('src', initialImage);
  await expect(page.getByRole('button', { name: 'Solicitar orçamento' })).toBeDisabled();
  await page.getByLabel('Escolha a configuração').selectOption('1133');
  const href = await page.getByRole('link', { name: 'Solicitar orçamento' }).getAttribute('href');
  const url = new URL(href);
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe('/5521991215101');
  const message = url.searchParams.get('text');
  expect(message).toContain('Referência: 1129');
  expect(message).toContain('GEL COAT ECO 220V. BIF');
  expect(message).toContain('78900370348693');
  expect(message).toContain('/produtos/spas-de-hidromassagem-sol-albacete-1129');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.locator('img').evaluateAll((images) =>
    images.forEach((image) => {
      image.loading = 'eager';
    }),
  );
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({
    path: `preview/produto-${testInfo.project.name}.png`,
    fullPage: true,
    scale: 'css',
  });
});

test('contato prepara mensagem sem enviá-la automaticamente', async ({ page }) => {
  await page.goto('/contato');
  await page.getByLabel('Seu nome').fill('Visitante de teste');
  await page.getByLabel('Sua mensagem').fill('Quero um orçamento para meu projeto.');
  await page.getByRole('checkbox').check();
  let outgoing;
  await page.route('https://wa.me/**', async (route) => {
    outgoing = new URL(route.request().url());
    await route.fulfill({ status: 200, body: '<p>Redirecionamento interceptado pelo teste.</p>' });
  });
  await page.getByRole('button', { name: 'Continuar no WhatsApp' }).click();
  await expect.poll(() => outgoing?.hostname).toBe('wa.me');
  expect(outgoing.searchParams.get('text')).toContain('Visitante de teste');
  expect(outgoing.searchParams.get('text')).toContain('Quero um orçamento para meu projeto.');
});

test('páginas institucionais, redirecionamento e 404', async ({ page, request }) => {
  for (const path of [
    '/empresa',
    '/servicos',
    '/projetos',
    '/projetos/solares-clube',
    '/projetos/vasco-da-gama',
    '/contato',
    '/politicas/privacidade',
  ]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), path).toBe(
      false,
    );
  }
  const oldUrl = await request.get('/perfil-triton-piscina', { maxRedirects: 0 });
  expect(oldUrl.status()).toBe(308);
  expect(oldUrl.headers().location).toBe('/empresa');
  const missing = await page.goto('/produtos/produto-inexistente');
  expect(missing.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Vamos voltar à superfície?' })).toBeVisible();
});

test('menu móvel permite chegar ao catálogo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await page
    .getByRole('navigation', { name: 'Navegação mobile' })
    .getByRole('link', { name: 'Produtos' })
    .click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

test('cabeçalhos de segurança sem bloquear fontes, imagens e efeitos', async ({ page }) => {
  const violations = [];
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) violations.push(message.text());
  });
  const response = await page.goto('/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['x-powered-by']).toBeUndefined();
  await page.evaluate(() => document.fonts.ready);
  // The hero effect loads Three.js, GSAP and textures after the first paint.
  await page.waitForFunction(() => document.querySelector('.hero-water')?.dataset.water);
  for (const path of [
    '/produtos/spas-de-hidromassagem-sol-albacete-1129',
    '/projetos/vasco-da-gama',
  ]) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }
  expect(violations).toEqual([]);
});

test('URLs antigas do WordPress chegam às páginas novas', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Verificação de servidor; basta um navegador.');
  const redirects = JSON.parse(await fs.readFile('src/data/redirecionamentos.json', 'utf8'));
  const old = [
    ...redirects.map((r) => [`${r.source}/`, r.destination]),
    ['/cart/', '/produtos'],
    ['/politica-de-privacidade-triton-piscinas/', '/politicas/privacidade'],
    ['/minha-conta/pedidos/', '/contato'],
  ];
  expect(redirects.length).toBeGreaterThan(400);
  for (const [source, destination] of old) {
    let url = source;
    let hops = 0;
    let response = await request.get(url, { maxRedirects: 0 });
    while ([301, 308].includes(response.status()) && hops < 3) {
      url = response.headers().location;
      hops++;
      response = await request.get(url, { maxRedirects: 0 });
    }
    expect(decodeURIComponent(url.replace(/\+/g, ' ')), source).toBe(
      decodeURIComponent(destination.replace(/\+/g, ' ')),
    );
    expect(response.status(), source).toBe(200);
  }
});

test('painel de edição fica fechado em produção sem o GitHub configurado', async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Verificação de servidor; basta um navegador.');
  expect((await request.get('/keystatic')).status()).toBe(404);
  expect((await request.get('/keystatic/collection/produtos')).status()).toBe(404);
  const write = await request.post('/api/keystatic/update', {
    headers: { 'no-cors': '1' },
    data: {},
  });
  expect(write.status()).toBe(404);
  expect((await request.get('/api/keystatic/tree', { headers: { 'no-cors': '1' } })).status()).toBe(
    404,
  );
});
