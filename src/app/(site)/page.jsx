import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/icon';
import WaterExperience from '@/components/water-experience';
import ProductCarousel from '@/components/product-carousel';
import ProjectShowcase from '@/components/project-showcase';
import PoolExperience from '@/components/pool-experience';
import './home-design.css';
import { ContactBanner } from '@/components/footer';
import { featuredProducts } from '@/lib/catalog';
import { categories, media, whatsappUrl } from '@/lib/site';
import assets from '@/data/assets.json';

export const metadata = { alternates: { canonical: '/' } };
export default async function HomePage() {
  return (
    <>
      <section className="hero">
        <Image
          className="hero-photo"
          src={media(assets.hero)}
          alt="Piscina de borda infinita em um espaço de lazer ao pôr do sol"
          width={1942}
          height={809}
          sizes="(max-width: 1050px) 1100px, 100vw"
          loading="eager"
          fetchPriority="high"
        />
        <WaterExperience />
        <div className="hero-shade" />
        <div className="container hero-content">
          <span className="eyebrow hero-eyebrow">
            <span /> MAIS VIDA AO SEU LAZER
          </span>
          <h1>
            Seu melhor momento
            <br />
            começa com um
            <br />
            <em>mergulho.</em>
          </h1>
          <p>
            Piscinas, spas e soluções de bem-estar.
            <br />
            Do seu primeiro sonho a cada detalhe do projeto.
          </p>
          <div className="hero-buttons">
            <Link className="button button-white" href="/produtos">
              Explore nossos produtos <Icon name="arrow" />
            </Link>
            <Link className="hero-secondary" href="/projetos">
              Inspire-se em nossos projetos <Icon name="right" size={17} />
            </Link>
          </div>
        </div>
        <div className="container hero-bottom">
          <span>PARA SUA CASA, HOTEL, CONDOMÍNIO OU CLUBE</span>
          <a href="#universo" aria-label="Explore o universo Triton">
            Explore <Icon name="down" size={17} />
          </a>
        </div>
        <div className="hero-side-note">ÁGUA. CONFORTO. BEM-ESTAR.</div>
      </section>
      <div className="trust-strip">
        <div className="container">
          <span>
            <Icon name="compass" /> Orientação para o seu projeto
          </span>
          <span>
            <Icon name="shield" /> Marcas que você conhece
          </span>
          <span>
            <Icon name="wrench" /> Da escolha à instalação
          </span>
          <span>
            <Icon name="message" /> Atendimento de verdade
          </span>
        </div>
      </div>
      <section className="section container" id="universo">
        <div className="section-heading">
          <div>
            <span className="eyebrow">O UNIVERSO TRITON</span>
            <h2>Um espaço. Muitas possibilidades.</h2>
          </div>
          <p>
            Encontre o que falta para transformar
            <br className="desktop-only" /> seu espaço no seu lugar favorito.
          </p>
        </div>
        <div className="category-grid">
          {categories.map((category, i) => (
            <Link
              key={category.slug}
              href={`/produtos?categoria=${category.slug}`}
              className="category-card"
            >
              <span className="category-number">0{i + 1}</span>
              <Icon name={category.icon} size={36} />
              <h3>{category.name}</h3>
              <span>{category.detail}</span>
              <Icon name="arrow" className="category-arrow" size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="featured-section featured-refined">
        <div className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESCOLHAS QUE TRANSFORMAM</span>
              <h2>
                Seu bem-estar começa
                <br /> <em>nos detalhes.</em>
              </h2>
            </div>
            <Link className="text-link" href="/produtos">
              Ver todos os produtos <Icon name="arrow" size={18} />
            </Link>
          </div>
          <ProductCarousel products={await featuredProducts()} />
          <div className="catalog-help">
            <Icon name="message" size={21} />
            <p>
              Não sabe por onde começar?{' '}
              <a
                href={whatsappUrl('Olá, Triton! Preciso de ajuda para escolher um produto.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                A gente ajuda você a escolher.
              </a>
            </p>
            <Icon name="arrow" size={18} />
          </div>
        </div>
      </section>
      <section className="story-section container section">
        <div className="story-image">
          <Image
            src={media(assets.swimmer)}
            alt="Nadador em uma piscina de água azul"
            width={850}
            height={900}
            sizes="(max-width: 1050px) 100vw, 50vw"
          />
          <div className="story-image-label">
            <Icon name="waves" size={27} />
            <span>
              Mais que piscinas.
              <br />
              <strong>Novas possibilidades.</strong>
            </span>
          </div>
        </div>
        <div className="story-copy">
          <span className="eyebrow">SEU PROJETO EM BOAS MÃOS</span>
          <h2>
            Você imagina.
            <br />A gente faz acontecer.
          </h2>
          <p>
            Uma área de lazer é um convite para viver melhor. Cuidamos de cada etapa para que você
            só precise pensar nos bons momentos que vêm pela frente.
          </p>
          <div className="service-list">
            {[
              [
                '01',
                'Construção de piscinas',
                'Projetos em fibra e concreto para diferentes espaços.',
              ],
              [
                '02',
                'Reformas e modernização',
                'Um novo olhar para a piscina que já faz parte da sua vida.',
              ],
              [
                '03',
                'Instalação de equipamentos',
                'Soluções de filtragem, aquecimento e tratamento.',
              ],
            ].map(([n, title, text]) => (
              <Link href="/servicos" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
          <Link href="/servicos" className="text-link">
            Conheça nossos serviços <Icon name="right" size={18} />
          </Link>
        </div>
      </section>
      <PoolExperience poster={media(assets.hero)} />
      <ProjectShowcase />
      <section className="brands-section container">
        <span className="eyebrow">GRANDES MARCAS. A CONFIANÇA TRITON.</span>
        <div className="brands-row">
          {assets.brands.map((b) => (
            <img
              key={b.nome}
              src={media(b.src)}
              alt={b.nome.replaceAll('-', ' ')}
              width="170"
              height="70"
              loading="lazy"
            />
          ))}
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
