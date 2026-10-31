import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import yaml from 'js-yaml';
import Markdoc from '@markdoc/markdoc';
import { formatDescription } from './description.js';

// One-time conversion of the migrated catalog into one Keystatic entry per product.
// Images move to public/midia/produtos/<slug>/, the layout Keystatic expects.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contentDir = path.join(root, 'content/produtos');
const mediaDir = path.join(root, 'public/midia/produtos');
const catalogFile = path.join(root, 'src/data/catalogo.json');
const featured = [1129, 1360, 1169, 1683, 1445, 1226, 1874, 1887, 1130, 1376, 1672, 1871];

try {
  await fs.access(contentDir);
  throw new Error('content/produtos já existe. A conversão é de uso único.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const products = JSON.parse(await fs.readFile(catalogFile, 'utf8'));

const escape = (text) =>
  text.replace(/[\\`*_[\]{}<>]/g, '\\$&').replace(/^(\s*)([#+-]|\d+\.)(\s)/, '$1\\$2$3');
function inline($, nodes) {
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      out += escape(node.data.replace(/\s+/g, ' '));
      continue;
    }
    if (node.type !== 'tag') continue;
    const inner = inline($, node.children);
    if (['strong', 'b', 'em', 'i'].includes(node.name)) {
      // Markdown emphasis cannot start or end with a space.
      const [, before, text, after] = inner.match(/^(\s*)(.*?)(\s*)$/s);
      const mark = ['strong', 'b'].includes(node.name) ? '**' : '_';
      // Emphasis on bare punctuation (e.g. a bold "|") has no visible effect and
      // Markdown may not parse it next to a word, so it is dropped.
      out += /[\p{L}\p{N}]/u.test(text) ? `${before}${mark}${text}${mark}${after}` : inner;
    } else if (node.name === 'a') {
      out += `[${inner}](${$(node).attr('href')})`;
    } else if (node.name === 'img') {
      out += `![${escape($(node).attr('alt') || '')}](${$(node).attr('src')})`;
    } else if (node.name === 'br') {
      out += ' ';
    } else {
      out += inner;
    }
  }
  return out;
}
function toMarkdoc(html) {
  const $ = cheerio.load(html, null, false);
  const blocks = [];
  for (const node of $.root().children().toArray()) {
    if (/^h[2-4]$/.test(node.name)) {
      blocks.push(`${'#'.repeat(Number(node.name[1]))} ${inline($, node.children).trim()}`);
    } else if (node.name === 'ul') {
      blocks.push(
        $(node)
          .children('li')
          .toArray()
          .map((li) => `- ${inline($, li.children).trim()}`)
          .join('\n'),
      );
    } else if (node.name === 'p' || node.name === 'img') {
      blocks.push(inline($, node.name === 'p' ? node.children : [node]).trim());
    } else {
      throw new Error(`Elemento inesperado na descrição: <${node.name}>`);
    }
  }
  return `${blocks.filter(Boolean).join('\n\n')}\n`;
}
// Canonical form for comparing the old and new HTML: tags and collapsed text.
function canonical(html) {
  const $ = cheerio.load(html, null, false);
  const walk = (nodes) =>
    nodes
      .map((node) => {
        if (node.type === 'text') return node.data.replace(/\s+/g, ' ');
        if (node.type !== 'tag') return '';
        const name = { b: 'strong', i: 'em' }[node.name] || node.name;
        const inner = walk(node.children);
        if (['span', 'br', 'article'].includes(name)) return inner;
        if (name === 'img') return `<img ${$(node).attr('src')}>`;
        if (name === 'a') return `<a ${$(node).attr('href')}>${inner}</a>`;
        if (['strong', 'em'].includes(name) && !/[\p{L}\p{N}]/u.test(inner)) return inner;
        return `<${name}>${inner}</${name}>`;
      })
      .join('');
  return walk($.root().contents().toArray())
    .replace(/\s*(<\/?(?:p|h[2-4]|ul|li)>)\s*/g, '$1')
    .replace(/<p>(<img [^>]+>)<\/p>/g, '$1')
    .replace(/<(strong|em)>(\s*)/g, '$2<$1>')
    .replace(/(\s*)<\/(strong|em)>/g, '</$2>$1')
    .replace(/\s*(<\/?(?:p|h[2-4]|ul|li)>)\s*/g, '$1')
    .replace(/ +/g, ' ')
    .trim();
}
const render = (source) => Markdoc.renderers.html(Markdoc.transform(Markdoc.parse(source)));

const copies = new Map();
// `name` follows Keystatic's own naming, so the first save in the panel
// does not rename every file: product photos are <slug>/imagens/<index>.
async function copyImage(src, slug, name) {
  const relative = src.replace(/^\/?midia\/produtos\//, '');
  const target = `${slug}/${name ?? path.basename(relative)}`;
  if (copies.has(target) && copies.get(target) !== relative) {
    throw new Error(`Nomes de imagem repetidos em ${target}`);
  }
  copies.set(target, relative);
  await fs.mkdir(path.dirname(path.join(mediaDir, target)), { recursive: true });
  await fs.copyFile(path.join(mediaDir, relative), path.join(mediaDir, target));
  return `/midia/produtos/${target}`;
}

await fs.mkdir(contentDir, { recursive: true });
const oldFolders = new Set();
for (const p of products) {
  let html = formatDescription(p.descricao);
  for (const src of html.match(/(?<=src=")[^"]+/g) || []) {
    oldFolders.add(src.split('/')[3]);
    html = html.replaceAll(src, await copyImage(src, p.slug));
  }
  const body = toMarkdoc(html);
  if (canonical(render(body)) !== canonical(html)) {
    console.error(canonical(html), '\n---\n', canonical(render(body)));
    throw new Error(`A descrição de ${p.id} mudou na conversão.`);
  }
  const images = [];
  for (const [index, image] of p.imagens.entries()) {
    oldFolders.add(image.split('/')[2]);
    images.push(await copyImage(image, p.slug, `imagens/${index}${path.extname(image)}`));
  }
  const position = featured.indexOf(p.id) + 1;
  // Keys follow the schema order, as Keystatic writes them.
  const data = {
    nome: p.nome,
    nomeCurto: p.nomeCurto,
    id: p.id,
    sku: p.sku || undefined,
    publicado: p.publicado,
    marca: p.marca,
    categoria: p.categoria,
    categorias: p.categorias,
    destaque: p.destaque,
    posicaoVitrine: position || undefined,
    resumo: p.resumo || undefined,
    imagens: images,
    especificacoes: p.especificacoes.map((s) => ({
      nome: s.nome,
      valores: s.valores,
      visivel: s.visivel !== false,
    })),
    variacoes: p.variacoes.map((v) => ({
      id: v.id,
      nome: v.nome || undefined,
      sku: v.sku || undefined,
      publicado: v.publicado,
      atributos: v.atributos.map((a) => ({ nome: a.nome, valores: a.valores })),
      descricao: v.descricao?.trim() || undefined,
      precos: {
        regular: v.precos.regular ?? undefined,
        promocional: v.precos.promocional ?? undefined,
      },
    })),
  };
  const frontmatter = yaml.dump(JSON.parse(JSON.stringify(data)));
  await fs.writeFile(path.join(contentDir, `${p.slug}.mdoc`), `---\n${frontmatter}---\n${body}`);
}
for (const folder of oldFolders) {
  await fs.rm(path.join(mediaDir, folder), { recursive: true, force: true });
}
await fs.rename(catalogFile, path.join(root, 'migration/catalogo-site.json'));
console.log(`${products.length} produtos convertidos e ${copies.size} imagens organizadas.`);
