import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalog, cardData, getProduct } from '@/lib/catalog';
import { categories, media, site } from '@/lib/site';
import ProductGallery from '@/components/product-gallery';
import QuoteBox from '@/components/quote-box';
import ProductCard from '@/components/product-card';
import ProductDescription from '@/components/product-description';
import SpecificationValues from '@/components/specification-values';
import Icon from '@/components/icon';

export async function generateStaticParams() {
  return (await getCatalog()).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: 'Produto não encontrado' };
  return {
    title: p.nomeCurto,
    description: (p.resumo || p.descricaoTexto).slice(0, 155),
    alternates: { canonical: `/produtos/${slug}` },
    openGraph: {
      title: p.nomeCurto,
      images: p.imagens.length ? [{ url: media(p.imagens[0]), alt: p.nomeCurto }] : [],
    },
  };
}
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const category = categories.find((c) => c.slug === p.categoria);
  const variations = p.variacoes
    .filter((v) => v.publicado)
    .map((v) => ({ id: v.id, nome: v.nome, sku: v.sku, atributos: v.atributos }));
  const specification = p.especificacoes.filter(
    (s) =>
      s.visivel !== false && !variations.some((v) => v.atributos.some((a) => a.nome === s.nome)),
  );
  const related = (await getCatalog())
    .filter((r) => r.categoria === p.categoria && r.id !== p.id)
    .slice(0, 4)
    .map(cardData);
  const description = p.descricao.replaceAll('src="/midia/', `src="${media('midia/')}`);
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.nome,
    description: p.resumo || p.descricaoTexto.slice(0, 400),
    brand: { '@type': 'Brand', name: p.marca },
    image: p.imagens.map((i) => new URL(media(i), site.url).href),
    url: `${site.url}/produtos/${p.slug}`,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }}
      />
      <section className="container product-page">
        <nav className="breadcrumbs" aria-label="Caminho da página">
          <Link href="/">Início</Link>
          <Icon name="next" />
          <Link href="/produtos">Produtos</Link>
          <Icon name="next" />
          <Link href={`/produtos?categoria=${p.categoria}`}>{category?.name}</Link>
          <Icon name="next" />
          <span aria-current="page">{p.nomeCurto}</span>
        </nav>
        <div className="product-detail-grid">
          <ProductGallery images={p.imagens} name={p.nomeCurto} slug={p.slug} />
          <div className="product-details">
            <span className="eyebrow">
              {p.marca} · {category?.name}
            </span>
            <h1>{p.nomeCurto}</h1>
            <p className="product-reference">
              Referência {p.id}
              {p.sku && ` · ${p.sku}`}
            </p>
            <p className="product-summary">{p.resumo}</p>
            <QuoteBox product={{ id: p.id, nome: p.nome, slug: p.slug }} variations={variations} />
            <div className="product-benefits">
              <span>
                <Icon name="check" size={16} /> Atendimento especializado para sua escolha
              </span>
              <span>
                <Icon name="check" size={16} /> Consulte entrega e instalação para sua região
              </span>
            </div>
          </div>
        </div>
        <div className="product-information">
          <div>
            <h2>Conheça cada detalhe.</h2>
            <ProductDescription html={description} summary={p.resumo || p.descricaoTexto} />
          </div>
          <div>
            <h2>Informações do produto</h2>
            <dl className="spec-list">
              <div>
                <dt>Marca</dt>
                <dd>{p.marca}</dd>
              </div>
              {specification.map((s, i) => (
                <div key={`${s.nome}-${i}`}>
                  <dt>{s.nome}</dt>
                  <dd>
                    <SpecificationValues name={s.nome} values={s.valores} />
                  </dd>
                </div>
              ))}
              {!specification.length && (
                <div>
                  <dt>Precisa de uma informação técnica?</dt>
                  <dd>
                    Nossa equipe pode ajudar a verificar as especificações para o seu projeto.
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="related">
          <div className="container">
            <span className="eyebrow">OUTRAS POSSIBILIDADES</span>
            <h2>Encontre o que combina com você.</h2>
            <div className="product-grid">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
