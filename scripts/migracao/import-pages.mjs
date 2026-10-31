import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pages = [
  ['privacidade', 'Política de privacidade', 'politica-de-privacidade-triton-piscinas'],
  [
    'entrega',
    'Entrega, troca e devolução',
    'politica-de-entrega-troca-e-devolucao-triton-piscinas',
  ],
  ['termos', 'Termos de uso', 'termos-de-uso-do-site-triton-piscinas'],
];
async function readSource(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (response.ok) return response.text();
  if (response.status !== 406) throw new Error(`Importa??o de ${url}: ${response.status}`);
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage();
    const navigation = await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (!navigation?.ok()) throw new Error(`Importa??o pelo navegador: ${url}`);
    return await page.content();
  } finally {
    await browser.close();
  }
}
const result = {};
for (const [slug, title, oldPath] of pages) {
  const url = `https://tritonpiscinas.com.br/${oldPath}/`;
  const source = await readSource(url);
  const $ = cheerio.load(source);
  const main = $('.entry-content').first();
  main.find('h1').remove();
  main
    .find(
      'script, style, form, iframe, img, svg, .elementor-widget-shortcode, .elementor-widget-sidebar',
    )
    .remove();
  // Decode Cloudflare's public email obfuscation before stripping presentation.
  main.find('[data-cfemail]').each((_, el) => {
    const hex = $(el).attr('data-cfemail');
    const key = parseInt(hex.slice(0, 2), 16);
    const email = hex
      .slice(2)
      .match(/../g)
      .map((v) => String.fromCharCode(parseInt(v, 16) ^ key))
      .join('');
    $(el).replaceWith($('<span>').text(email));
  });
  let html = sanitizeHtml(main.html() || '', {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'br', 'strong', 'b', 'em', 'a'],
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    transformTags: {
      h1: 'h2',
      a: (tagName, attribs) => {
        const href = attribs.href || '';
        const local = href.includes('politica-de-privacidade')
          ? '/politicas/privacidade'
          : href.includes('politica-de-entrega')
            ? '/politicas/entrega'
            : href.includes('termos-de-uso')
              ? '/politicas/termos'
              : href;
        return { tagName, attribs: { href: local } };
      },
    },
  });
  html = html.replace(/<h[1-6][^>]*>\s*Busque seu produto[\s\S]*$/i, '').trim();
  if (html.length < 300) throw new Error(`Conteúdo incompleto: ${url}`);
  result[slug] = { title, source: url, html };
  console.log(`${slug}: ${html.length} caracteres importados`);
}
await fs.writeFile(path.join(root, 'src/data/politicas.json'), JSON.stringify(result, null, 2));
