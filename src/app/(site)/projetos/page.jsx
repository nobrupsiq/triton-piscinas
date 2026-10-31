import Image from 'next/image';
import Link from 'next/link';
import PageIntro from '@/components/page-intro';
import { ContactBanner } from '@/components/footer';
import Icon from '@/components/icon';
import SharedImage from '@/components/shared-image';
import { projects } from '@/lib/projects';
import { media } from '@/lib/site';
export const metadata = { title: 'Projetos realizados', alternates: { canonical: '/projetos' } };
export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="DA IDEIA À REALIDADE"
        title="Espaços para viver histórias."
        breadcrumb="Projetos"
        description="Conheça alguns dos projetos que fazem parte da trajetória da Triton. Soluções para o lazer, a convivência e o esporte."
      />
      <section className="container section">
        <div className="project-grid">
          {projects.map((p) => (
            <Link href={`/projetos/${p.slug}`} className="project-card" key={p.slug}>
              <div className="project-image">
                <SharedImage name={`projeto-${p.slug}`}>
                  <Image
                    src={media(p.cover)}
                    alt={`Piscina do ${p.name}`}
                    width={800}
                    height={550}
                    sizes="(max-width: 700px) 100vw, 50vw"
                  />
                </SharedImage>
                <span className="project-tag">{p.type.toUpperCase()}</span>
                <span className="project-arrow">
                  <Icon name="arrow" />
                </span>
              </div>
              <div className="project-title">
                <h3>{p.name}</h3>
                <span>{p.location}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
