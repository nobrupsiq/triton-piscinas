import Image from 'next/image';
import Link from 'next/link';
import Icon from './icon';
import SharedImage from './shared-image';
import { projects } from '@/lib/projects';
import { media, whatsappUrl } from '@/lib/site';

export default function ProjectShowcase() {
  const [solares, vasco] = projects;
  const detail = solares.images.find((image) => image.nome === 'bar molado solares triton 02');
  return (
    <section className="project-showcase section" aria-labelledby="showcase-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DA IDEIA À REALIDADE</span>
            <h2 id="showcase-title">
              O próximo cenário de boas histórias
              <br />
              <em>pode ser o seu.</em>
            </h2>
          </div>
          <p>
            Espaços para reunir, relaxar e ir além.
            <br />
            Conheça projetos que já fazem parte da nossa história.
          </p>
        </div>
        <div className="showcase-grid">
          {[solares, vasco].map((project, index) => (
            <Link
              key={project.slug}
              href={`/projetos/${project.slug}`}
              className={`showcase-card showcase-card-${index + 1}`}
            >
              <SharedImage name={`projeto-${project.slug}`}>
                <Image
                  src={media(project.cover)}
                  alt={`Piscina do ${project.name}`}
                  width={1000}
                  height={800}
                  sizes="(max-width: 700px) 100vw, 60vw"
                />
              </SharedImage>
              <span className="showcase-tag">{project.type}</span>
              <div className="showcase-caption">
                <div>
                  <span className="showcase-location">
                    <Icon name="pin" size={15} />
                    {project.location}
                  </span>
                  <h3>{project.name}</h3>
                  <span className="showcase-discover">Conheça o projeto</span>
                </div>
                <span className="showcase-arrow">
                  <Icon name="arrow" size={24} />
                </span>
              </div>
            </Link>
          ))}
          <div className="showcase-invitation">
            <img
              src={media(detail?.src || solares.cover)}
              alt="Área de convivência na piscina do Solares Clube"
              width="500"
              height="500"
              loading="lazy"
            />
            <div>
              <span className="eyebrow">SEU ESPAÇO, NOVAS POSSIBILIDADES</span>
              <h3>
                Vamos imaginar
                <br />o seu projeto?
              </h3>
              <a
                href={whatsappUrl(
                  'Olá, Triton! Vi os projetos no site e gostaria de planejar uma área de lazer para o meu espaço.',
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Quero um projeto assim <Icon name="arrow" size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="showcase-footer">
          <p>Da área de lazer aos espaços de esporte e convivência.</p>
          <Link href="/projetos" className="text-link">
            Explore nossos projetos <Icon name="arrow" size={19} />
          </Link>
        </div>
      </div>
    </section>
  );
}
