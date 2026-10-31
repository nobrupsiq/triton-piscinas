import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCatalog } from '../src/lib/catalog.js';

// Maps the WordPress product and category permalinks to the new routes.
// Products are matched by ID, so renamed products keep their redirect.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const origin = 'https://tritonpiscinas.com.br';
const published = new Map((await getCatalog()).map((p) => [p.id, p]));

async function readAll(type, fields) {
  const items = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const url = `${origin}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_fields=${fields}`;
    // The server answers 406 to generic user agents.
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Importação de ${url}: ${response.status}`);
    pages = Number(response.headers.get('x-wp-totalpages')) || 1;
    items.push(...(await response.json()));
  }
  return items;
}
// Next.js removes the trailing slash before matching redirects.
const pathname = (link) => new URL(link).pathname.replace(/\/$/, '');

const products = await readAll('product', 'id,link,product_cat');
const categories = await readAll('product_cat', 'id,link');
const missing = products.filter((p) => !published.has(p.id));
if (missing.length) {
  throw new Error(`Produtos sem correspondência: ${missing.map((p) => p.id).join(', ')}`);
}

const redirects = products.map((p) => ({
  source: pathname(p.link),
  destination: `/produtos/${published.get(p.id).slug}`,
}));
for (const category of categories) {
  const items = products
    .filter((p) => p.product_cat.includes(category.id))
    .map((p) => published.get(p.id));
  const groups = [...new Set(items.map((p) => p.categoria))];
  const brands = [...new Set(items.map((p) => p.marca))];
  const params = new URLSearchParams();
  if (groups.length === 1) params.set('categoria', groups[0]);
  // Add the brand only when it narrows the destination.
  const narrows =
    groups.length !== 1 ||
    [...published.values()].some((p) => p.categoria === groups[0] && p.marca !== brands[0]);
  if (brands.length === 1 && narrows) params.set('marca', brands[0]);
  redirects.push({
    source: pathname(category.link),
    destination: `/produtos${params.size ? `?${params}` : ''}`,
  });
}

const sources = redirects.map((r) => r.source);
if (new Set(sources).size !== sources.length) throw new Error('Origens duplicadas.');
await fs.writeFile(
  path.join(root, 'src/data/redirecionamentos.json'),
  `${JSON.stringify(redirects, null, 2)}\n`,
);
console.log(`${products.length} produtos e ${categories.length} categorias mapeados.`);
