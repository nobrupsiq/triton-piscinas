import Markdoc from '@markdoc/markdoc';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config.js';
import { categories } from './site.js';

const reader = createReader(process.cwd(), keystaticConfig);

export const normalize = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function plainText(node) {
  if (node.type === 'text') return node.attributes.content;
  const text = node.children.map(plainText).join('');
  return node.type === 'inline' ? text : `${text}\n`;
}
// Entries come from the Keystatic panel; invalid data fails the build
// instead of publishing a broken catalog.
function check(products) {
  const errors = [];
  const ids = new Map();
  for (const p of products) {
    for (const id of [p.id, ...p.variacoes.map((v) => v.id)]) {
      if (ids.has(id)) errors.push(`Referência ${id} repetida em ${p.slug} e ${ids.get(id)}`);
      ids.set(id, p.slug);
    }
    if (!categories.some((c) => c.slug === p.categoria)) {
      errors.push(`Categoria inválida em ${p.slug}`);
    }
  }
  if (errors.length) throw new Error(`Catálogo inválido:\n${errors.join('\n')}`);
}

async function load() {
  const entries = await reader.collections.produtos.all({ resolveLinkedFiles: true });
  const products = entries.map(({ slug, entry }) => {
    const ast = entry.descricao.node;
    return {
      ...entry,
      slug,
      // media() expects paths relative to the asset base.
      imagens: entry.imagens.map((image) => image.replace(/^\//, '')),
      variacoes: entry.variacoes.map((v) => ({ ...v, nome: v.nome || entry.nome })),
      descricao: Markdoc.renderers
        .html(Markdoc.transform(ast))
        .replace(/^<article>|<\/article>$/g, '')
        // Markdoc escapes text but keeps any link scheme typed in the editor.
        .replace(/href="\s*(?:javascript|data|vbscript):[^"]*"/gi, 'href="#"'),
      descricaoTexto: plainText(ast).replace(/\s+/g, ' ').trim(),
    };
  });
  check(products);
  return products.sort((a, b) => a.id - b.id);
}
let cached;
// In development the panel edits files while the server runs, so read them again.
export async function getAllProducts() {
  if (process.env.NODE_ENV === 'development') return load();
  return (cached ??= load());
}
export async function getCatalog() {
  return (await getAllProducts()).filter((p) => p.publicado);
}
export async function getProduct(slug) {
  return (await getCatalog()).find((p) => p.slug === slug);
}
export function cardData(p) {
  return {
    id: p.id,
    slug: p.slug,
    nome: p.nomeCurto,
    marca: p.marca,
    categoria: p.categoria,
    imagem: p.imagens[0],
    configuracoes: p.variacoes.filter((v) => v.publicado).length,
    detalhe: p.resumo?.match(/capacidade\s+para\s+\d+\s+pessoas?/i)?.[0] || '',
  };
}
export async function featuredProducts() {
  return (await getCatalog())
    .filter((p) => p.posicaoVitrine && p.imagens.length)
    .sort((a, b) => a.posicaoVitrine - b.posicaoVitrine)
    .map(cardData);
}
