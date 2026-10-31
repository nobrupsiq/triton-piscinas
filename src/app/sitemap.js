import { getCatalog } from '@/lib/catalog';
import { site } from '@/lib/site';
export default async function sitemap() {
  const catalog = await getCatalog();
  return [
    '',
    '/produtos',
    '/servicos',
    '/empresa',
    '/contato',
    '/projetos',
    '/projetos/solares-clube',
    '/projetos/vasco-da-gama',
    ...catalog.map((p) => `/produtos/${p.slug}`),
  ].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path.startsWith('/produtos/') ? 'monthly' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
