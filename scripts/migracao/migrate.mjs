import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import sharp from 'sharp';
import sanitizeHtml from 'sanitize-html';
import he from 'he';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// The catalog now lives in content/produtos and is edited in the Keystatic panel.
// Running the WordPress import again would recreate the old image folders.
await fs
  .access(path.join(root, 'content/produtos'))
  .then(() => {
    throw new Error('O catálogo já foi migrado para content/produtos. Não rode este script.');
  })
  .catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
const workspace = path.dirname(root);
const sourceRoot = path.join(workspace, 'Imagens extraidas');
const dataRoot = path.join(root, 'src/data');
const outputRoot = path.join(root, 'public');
const raw = await fs.readFile(path.join(workspace, 'produtos/catalogo-triton.json'), 'utf8');
const original = JSON.parse(raw.replace(/^\uFEFF/, ''));
const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const cleanText = (s = '') =>
  he
    .decode(s)
    .replace(/\[(?:\/?(?:maxbutton|caption|gallery|woocommerce)[^\]]*)\]/gi, '')
    .replace(/-{4,}/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
const sourcePath = (url) => {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname);
    if (!pathname.includes('/wp-content/uploads/')) return null;
    const relative = pathname.split('/wp-content/uploads/')[1];
    const resolved = path.resolve(sourceRoot, relative);
    return resolved.startsWith(sourceRoot + path.sep) ? relative.replaceAll('\\', '/') : null;
  } catch {
    return null;
  }
};
const imageDestinations = new Map();
const urlMap = new Map();
const missing = new Set();
const usedDestinations = new Set();

// First use determines a stable, human-readable path, including the product ID.
for (const product of original.produtos) {
  const folder = `${product.id}-${slugify(product.nome)}`;
  for (const record of [product, ...(product.variacoes || [])]) {
    for (const [index, url] of (record.imagens || []).entries()) {
      const relative = sourcePath(url);
      if (!relative) {
        missing.add(url);
        continue;
      }
      if (!imageDestinations.has(relative)) {
        const variation = record.id === product.id ? '' : `-variacao-${record.id}`;
        const destination = `midia/produtos/${folder}/${folder}${variation}-${String(index + 1).padStart(2, '0')}.webp`;
        imageDestinations.set(relative, destination);
        usedDestinations.add(destination);
      }
      urlMap.set(url, imageDestinations.get(relative));
    }
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const lists = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    ),
  );
  return lists.flat().sort();
}
const files = (await walk(sourceRoot)).filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
for (const file of files) {
  const relative = path.relative(sourceRoot, file).replaceAll('\\', '/');
  if (!imageDestinations.has(relative)) {
    const parsed = path.posix.parse(relative);
    const base = `midia/acervo/${slugify(parsed.dir + '-' + parsed.name)}`;
    let destination = `${base}.webp`;
    if (usedDestinations.has(destination))
      destination = `${base}-${crypto.createHash('sha256').update(relative).digest('hex').slice(0, 8)}.webp`;
    imageDestinations.set(relative, destination);
    usedDestinations.add(destination);
  }
  urlMap.set(
    `https://tritonpiscinas.com.br/wp-content/uploads/${relative}`,
    imageDestinations.get(relative),
  );
}

// Inspect legacy HTML and metadata too. Thumbnail URLs can use their original.
const uploadPattern = /https?:[^\s"<>\\,]+\/wp-content\/uploads\/[^\s"<>\\,]+/g;
const embedded = [...new Set(raw.match(uploadPattern) || [])];
// These two embedded diagrams also exist in their product's exported gallery.
const legacyAliases = {
  '2018/10/reserva-rede-de-proteção-para-piscina-incisor-triton-piscinas-1-300x300.jpg':
    '2018/10/reserva-rede-de-protecao-para-piscina-incisor-triton-piscinas-1.jpg',
  '2018/10/reserva-capa-térmica-para-piscina-incisor-triton-piscinas-300x300.jpg':
    '2018/10/reserva-capa-termica-para-piscina-incisor-triton-piscinas-1.jpg',
};
const thumbnailFallbacks = [];
for (const url of embedded) {
  const relative = sourcePath(url);
  if (!relative) continue;
  let destination = imageDestinations.get(relative);
  if (!destination) {
    const fullSize = legacyAliases[relative] || relative.replace(/-\d+x\d+(?=\.[^.]+$)/, '');
    destination = imageDestinations.get(fullSize);
    if (destination) thumbnailFallbacks.push({ url, original: fullSize });
  }
  if (destination) urlMap.set(url, destination);
  else missing.add(url);
}

await fs.mkdir(dataRoot, { recursive: true });
let totalSourceBytes = 0;
let totalOutputBytes = 0;
for (let i = 0; i < files.length; i += 8) {
  await Promise.all(
    files.slice(i, i + 8).map(async (file) => {
      const relative = path.relative(sourceRoot, file).replaceAll('\\', '/');
      const destination = path.join(outputRoot, imageDestinations.get(relative));
      await fs.mkdir(path.dirname(destination), { recursive: true });
      const input = await fs.readFile(file);
      totalSourceBytes += input.length;
      const output = await sharp(input)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();
      await fs.writeFile(destination, output);
      totalOutputBytes += output.length;
    }),
  );
}

const replaceUrls = (value) => {
  if (typeof value === 'string') {
    return value.replace(uploadPattern, (url) => (urlMap.has(url) ? `/${urlMap.get(url)}` : url));
  }
  if (Array.isArray(value)) return value.map(replaceUrls);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceUrls(v)]));
  return value;
};

function categoryOf(p) {
  const categories = p.categorias
    .map((c) => c.caminho)
    .join('|')
    .toLowerCase();
  const name = p.nome.toLowerCase();
  if (/acessórios|almofada|base guarda|base ombrelone/.test(name)) return 'acessorios';
  if (/^spas?\b/.test(name)) return 'spas';
  if (/^banheiras?|^ofur/.test(name)) return 'banheiras';
  if (/aquecimento|energia solar|gerador de água quente/.test(categories)) return 'aquecimento';
  if (/sauna|gerador de vapor|gerador de calor/.test(categories)) return 'saunas';
  if (/filtros para piscinas|motobombas/.test(categories)) return 'piscinas';
  return 'acessorios';
}
function brandOf(p) {
  if (/nature\s*rio/i.test(p.nome)) return 'Nature Rio';
  const brand = p.categorias
    .map((c) => c.niveis[0])
    .find((c) => ['Albacete', 'Incisor', 'Namarra', 'GDA Fundidos'].includes(c));
  return brand || p.marcas?.[0] || 'Triton';
}
function safeDescription(html = '') {
  const cleaned = cleanText(replaceUrls(html)).replace(/\[maxbutton[^\]]*\]/gi, '');
  return sanitizeHtml(cleaned, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'ul',
      'ol',
      'li',
      'h2',
      'h3',
      'h4',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'img',
      'a',
      'blockquote',
    ],
    allowedAttributes: {
      img: ['src', 'alt'],
      a: ['href', 'title'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    transformTags: { h1: 'h2' },
    exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src?.startsWith('/midia/'),
  });
}

const products = original.produtos.map((p) => ({
  id: p.id,
  slug: `${slugify(p.nome)}-${p.id}`,
  nome: cleanText(p.nome),
  nomeCurto: cleanText(p.nome).replace(/\s*[-–]\s*(ALBACETE|NAMARRA|INCISOR|GDA.*)$/i, ''),
  sku: p.sku,
  publicado: p.publicado === '1',
  visibilidade: p.visibilidade,
  marca: brandOf(p),
  categoria: categoryOf(p),
  categorias: p.categorias.filter((c) => !/^\d+D$/.test(c.caminho)).map((c) => c.caminho),
  destaque: p.destaque,
  resumo: cleanText(p.descricaoCurta?.texto),
  descricao: safeDescription(p.descricao?.html),
  descricaoTexto: cleanText(p.descricao?.texto),
  imagens: p.imagens.map((url) => urlMap.get(url)).filter(Boolean),
  precos: p.precos,
  estoque: p.estoque,
  envio: p.envio,
  atributos: p.atributos,
  especificacoes: p.especificacoes,
  relacionamentos: p.relacionamentos,
  variacoes: p.variacoes.map((v) => ({
    id: v.id,
    nome: cleanText(v.nome),
    sku: v.sku,
    publicado: v.publicado === '1',
    atributos: v.atributos,
    precos: v.precos,
    estoque: v.estoque,
    descricao: cleanText(v.descricao?.texto),
    imagens: v.imagens.map((url) => urlMap.get(url)).filter(Boolean),
  })),
}));

const asset = (relative) => {
  if (!imageDestinations.has(relative)) throw new Error(`Asset editorial ausente: ${relative}`);
  return imageDestinations.get(relative);
};
// Keep the client's improved hero when regenerating the WordPress catalog.
const heroPath = 'midia/editorial/hero-piscina-por-do-sol.webp';
await fs.mkdir(path.join(outputRoot, 'midia/editorial'), { recursive: true });
await sharp(path.join(root, 'assets/hero-piscina-por-do-sol.png'))
  .webp({ quality: 90 })
  .toFile(path.join(outputRoot, heroPath));
const assets = {
  hero: heroPath,
  swimmer: asset('2020/01/mergulhador-vista-area-triton-piscinas.jpg'),
  logo: asset('2019/02/logo-triton-cor.png'),
  spa: asset('2019/11/ambiente-playazo-g-slide-2.jpg'),
  projects: {
    solares: [...imageDestinations.keys()]
      .filter((key) => key.startsWith('2019/11/') && /solares/.test(key))
      .map((key) => ({
        src: asset(key),
        nome: path.basename(key, path.extname(key)).replaceAll('-', ' '),
      })),
    vasco: [...imageDestinations.keys()]
      .filter((key) => key.startsWith('2019/11/cr-vasco-da-gama-'))
      .map((key) => ({ src: asset(key), nome: path.basename(key, '.jpg').replaceAll('-', ' ') })),
  },
  brands: ['albacete', 'incisor', 'namarra', 'gda', 'nature-rio'].map((brand) => ({
    nome: brand,
    src: asset(`2022/09/logo-${brand}-339X140.png`),
  })),
};
const report = {
  fonteSha256: crypto.createHash('sha256').update(raw).digest('hex'),
  produtos: products.length,
  produtosPublicados: products.filter((p) => p.publicado && p.visibilidade !== 'hidden').length,
  variacoes: products.reduce((n, p) => n + p.variacoes.length, 0),
  arquivosConvertidos: files.length,
  bytesOriginais: totalSourceBytes,
  bytesOtimizados: totalOutputBytes,
  imagensAusentes: [...missing],
  miniaturasSubstituidasPeloOriginal: thumbnailFallbacks,
  imagensCompartilhadas:
    'URLs compartilhadas reutilizam o primeiro destino, sem duplicar arquivos.',
};
await fs.writeFile(path.join(dataRoot, 'catalogo.json'), JSON.stringify(products));
await fs.writeFile(path.join(dataRoot, 'assets.json'), JSON.stringify(assets, null, 2));
const reportDir = path.join(root, 'migration');
await fs.mkdir(reportDir, { recursive: true });
await fs.writeFile(path.join(reportDir, 'relatorio.json'), JSON.stringify(report, null, 2));
await fs.writeFile(
  path.join(reportDir, 'mapa-imagens.json'),
  JSON.stringify(Object.fromEntries([...urlMap.entries()].sort()), null, 2),
);
await fs.writeFile(
  path.join(reportDir, 'catalogo-triton-migrado.json'),
  JSON.stringify(replaceUrls(original), null, 2),
);

await fs.mkdir(path.join(root, 'src/fonts'), { recursive: true });
for (const [family, file] of [
  ['Bogue', 'Bogue-Regular.ttf'],
  ['Bogue', 'Bogue-Medium.ttf'],
  ['Lexend', 'Lexend-Regular.ttf'],
  ['Lexend', 'Lexend-Light.ttf'],
  ['Lexend', 'Lexend-Medium.ttf'],
  ['Lexend', 'Lexend-SemiBold.ttf'],
]) {
  await fs.copyFile(
    path.join(workspace, 'fonts', family, file),
    path.join(root, 'src/fonts', file),
  );
}
console.log(JSON.stringify(report, null, 2));
if (missing.size) process.exitCode = 1;
