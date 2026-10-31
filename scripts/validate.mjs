import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllProducts } from '../src/lib/catalog.js';

// Checks the catalog edited in the Keystatic panel. The build runs the same
// data rules (src/lib/catalog.js); this script adds the image files.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const products = await getAllProducts();
const errors = [];
const warnings = [];
for (const p of products) {
  if (p.publicado && !p.imagens.length) warnings.push(`${p.slug}: sem fotos`);
  const sources = [
    ...p.imagens,
    ...[...p.descricao.matchAll(/src="\/?([^"]+)"/g)].map((m) => m[1]),
  ];
  for (const image of sources) {
    const stat = await fs.stat(path.join(root, 'public', image)).catch(() => null);
    if (!stat) errors.push(`${p.slug}: imagem ausente ${image}`);
    else if (stat.size > 1024 * 1024) {
      warnings.push(`${p.slug}: ${image} tem ${(stat.size / 1e6).toFixed(1)} MB`);
    }
  }
}
const featured = products.filter((p) => p.publicado && p.posicaoVitrine);
const positions = featured.map((p) => p.posicaoVitrine);
if (new Set(positions).size !== positions.length) {
  warnings.push('Há produtos com a mesma posição na vitrine.');
}
for (const warning of warnings) console.warn(`Aviso: ${warning}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const published = products.filter((p) => p.publicado);
console.log(
  `OK: ${published.length} produtos publicados de ${products.length}, ${featured.length} na vitrine.`,
);
