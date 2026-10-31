import Link from 'next/link';
import PageIntro from '@/components/page-intro';
import ProductCard from '@/components/product-card';
import Icon from '@/components/icon';
import { getCatalog, cardData, normalize } from '@/lib/catalog';
import { categories } from '@/lib/site';
import { ContactBanner } from '@/components/footer';

export const metadata = {
  title: 'Produtos',
  description:
    'Explore piscinas, spas, banheiras, saunas, aquecimento e acessórios. Encontre a configuração ideal e solicite seu orçamento.',
  alternates: { canonical: '/produtos' },
};
const single = (value) => (typeof value === 'string' ? value : '');
export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const query = single(params.q).trim().slice(0, 150);
  const category = single(params.categoria);
  const brand = single(params.marca);
  const order = single(params.ordem) || 'destaques';
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const filtered = catalog.filter((p) => {
    const haystack = normalize(
      `${p.nome} ${p.marca} ${p.sku || ''} ${p.id} ${p.categorias.join(' ')}`,
    );
    return (
      (!category || p.categoria === category) &&
      (!brand || p.marca === brand) &&
      terms.every((term) => haystack.includes(term))
    );
  });
  if (order === 'az') filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  else if (order === 'za') filtered.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
  else filtered.sort((a, b) => Number(b.destaque) - Number(a.destaque));
  const pageSize = 16;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const requestedPage = Number.parseInt(single(params.pagina), 10);
  const page = Math.max(1, Math.min(pageCount, Number.isFinite(requestedPage) ? requestedPage : 1));
  const displayed = filtered.slice((page - 1) * pageSize, page * pageSize);
  function href(changes) {
    const next = new URLSearchParams({
      ...(query && { q: query }),
      ...(category && { categoria: category }),
      ...(brand && { marca: brand }),
      ...(order !== 'destaques' && { ordem: order }),
      ...changes,
    });
    for (const [key, value] of [...next]) if (!value) next.delete(key);
    return `/produtos${next.size ? '?' + next.toString() : ''}#busca`;
  }
  const visiblePages = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b);
  return (
    <>
      <PageIntro
        eyebrow="ENCONTRE SEU PRÓXIMO BOM MOMENTO"
        title="Tudo para o seu espaço."
        breadcrumb="Produtos"
        description="Explore nossas linhas e encontre a solução que combina com você. A Triton ajuda com cada detalhe da escolha."
      />
      <section className="container catalog-section" id="busca">
        <form action="/produtos#busca" className="filter-form" role="search">
          <label className="field search-field">
            <span>O que você procura?</span>
            <div className="search-input">
              <Icon name="search" size={19} />
              <input
                name="q"
                type="search"
                placeholder="Busque por produto, marca ou referência"
                defaultValue={query}
                key={query}
              />
            </div>
          </label>
          <label className="field">
            <span>Marca</span>
            <select name="marca" defaultValue={brand} key={brand}>
              <option value="">Todas as marcas</option>
              {[...new Set(catalog.map((p) => p.marca))].sort().map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Ordenar por</span>
            <select name="ordem" defaultValue={order} key={order}>
              <option value="destaques">Destaques</option>
              <option value="az">Nome: A a Z</option>
              <option value="za">Nome: Z a A</option>
            </select>
          </label>
          {category && <input type="hidden" name="categoria" value={category} />}
          <button type="submit" className="button button-blue">
            Buscar <Icon name="search" size={17} />
          </button>
        </form>
        <nav className="category-tabs" aria-label="Categorias de produtos">
          <Link
            href={href({ categoria: '' })}
            className={!category ? 'active' : ''}
            aria-current={!category ? 'page' : undefined}
          >
            Todos os produtos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={href({ categoria: c.slug })}
              className={category === c.slug ? 'active' : ''}
              aria-current={category === c.slug ? 'page' : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="results-heading">
          <p>
            <strong>{filtered.length}</strong>{' '}
            {filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            {query && <> para “{query}”</>}
          </p>
          {query || brand || category ? (
            <Link className="text-link" href="/produtos#busca">
              Limpar filtros <Icon name="close" size={14} />
            </Link>
          ) : (
            <span>Escolha com calma. Conte com a gente.</span>
          )}
        </div>
        {displayed.length ? (
          <>
            <div className="product-grid">
              {displayed.map((p) => (
                <ProductCard key={p.id} product={cardData(p)} />
              ))}
            </div>
            {pageCount > 1 && (
              <nav className="pagination" aria-label="Páginas de produtos">
                {page > 1 && (
                  <Link href={href({ pagina: String(page - 1) })} aria-label="Página anterior">
                    <Icon name="previous" size={17} />
                  </Link>
                )}
                {visiblePages.map((n, i) => (
                  <span className="contents" key={n}>
                    {i > 0 && n - visiblePages[i - 1] > 1 && <span className="ellipsis">…</span>}
                    <Link
                      href={href({ pagina: String(n) })}
                      aria-label={`Página ${n}`}
                      aria-current={n === page ? 'page' : undefined}
                    >
                      {n}
                    </Link>
                  </span>
                ))}
                {page < pageCount && (
                  <Link href={href({ pagina: String(page + 1) })} aria-label="Próxima página">
                    <Icon name="next" size={17} />
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Icon name="search" size={35} />
            <h2>Vamos tentar de outro jeito?</h2>
            <p>
              Não encontramos produtos com esses filtros. Tente outro termo ou explore o catálogo
              completo.
            </p>
            <Link href="/produtos#busca" className="button button-blue">
              Ver todos os produtos <Icon name="right" />
            </Link>
          </div>
        )}
      </section>
      <ContactBanner />
    </>
  );
}
