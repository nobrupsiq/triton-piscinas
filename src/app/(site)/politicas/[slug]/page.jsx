import { notFound } from 'next/navigation';
import PageIntro from '@/components/page-intro';
import Link from 'next/link';
import policies from '@/data/politicas.json';
export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: policies[slug]?.title || 'Página não encontrada', robots: { index: false } };
}
export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();
  return (
    <>
      <PageIntro eyebrow="INFORMAÇÕES TRITON" title={policy.title} />
      <section className="container section">
        <article className="policy-content">
          <nav className="policy-nav" aria-label="Documentos da Triton">
            {Object.entries(policies).map(([key, item]) => (
              <Link
                key={key}
                href={`/politicas/${key}`}
                aria-current={key === slug ? 'page' : undefined}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div dangerouslySetInnerHTML={{ __html: policy.html }} />
        </article>
      </section>
    </>
  );
}
