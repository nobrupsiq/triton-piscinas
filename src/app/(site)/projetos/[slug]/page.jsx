import { notFound } from 'next/navigation';
import PageIntro from '@/components/page-intro';
import { ContactBanner } from '@/components/footer';
import { projects } from '@/lib/projects';
import { media } from '@/lib/site';
import ProjectGallery from '@/components/project-gallery';
import SharedImage from '@/components/shared-image';
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project?.name || 'Projeto não encontrado',
    alternates: { canonical: `/projetos/${slug}` },
  };
}
export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <>
      <PageIntro
        eyebrow={`${project.type} · ${project.location}`}
        title={project.name}
        breadcrumb={`Projetos / ${project.name}`}
        description={project.description}
      />
      <section className="container section">
        <SharedImage name={`projeto-${project.slug}`}>
          <img
            className="w-full rounded-md object-cover max-h-[580px]"
            src={media(project.cover)}
            alt={`Vista da piscina do ${project.name}`}
            width="1320"
            height="700"
            fetchPriority="high"
          />
        </SharedImage>
        <ProjectGallery images={project.images} name={project.name} slug={slug} />
      </section>
      <ContactBanner />
    </>
  );
}
