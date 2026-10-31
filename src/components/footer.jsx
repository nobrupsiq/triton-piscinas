import Link from 'next/link';
import Image from 'next/image';
import Icon from './icon';
import assets from '@/data/assets.json';
import { categories, media, site, whatsappUrl } from '@/lib/site';

export function ContactBanner() {
  return (
    <section className="contact-banner">
      <div className="container contact-banner-inner">
        <div>
          <span className="eyebrow">DO PRIMEIRO PASSO AO PRIMEIRO MERGULHO</span>
          <h2>Vamos dar vida ao seu projeto?</h2>
          <p>Conte com a Triton para encontrar a solução certa para o seu espaço.</p>
        </div>
        <a
          href={whatsappUrl()}
          className="button button-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          Converse com um especialista <Icon name="arrow" />
        </a>
      </div>
    </section>
  );
}
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <Link href="/" aria-label="Triton Piscinas — início" className="footer-brand">
            <img src={media(assets.logo)} alt="Triton Piscinas" width="164" height="59" />
          </Link>
          <p>
            Água, conforto e boas histórias.
            <br />
            Tudo para viver o seu melhor momento.
          </p>
          <a
            href={whatsappUrl()}
            className="footer-phone"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="message" />
            {site.phone}
          </a>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/empresa">A Triton</Link>
          <Link href="/servicos">Nossos serviços</Link>
          <Link href="/projetos">Projetos realizados</Link>
          <Link href="/contato">Fale conosco</Link>
        </div>
        <div>
          <h3>Encontre seu produto</h3>
          {categories.map((c) => (
            <Link key={c.slug} href={`/produtos?categoria=${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
        <div>
          <div className="footer-credit">
            <p>
              Desenvolvedor e designer: <strong>Bruno Siqueira</strong>
            </p>
            <a
              href="https://wa.me/5521971699008"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Conversar com Bruno Siqueira no WhatsApp"
            >
              <Image
                src="/branding/bruno-siqueira-monograma.png"
                alt="Logo de Bruno Siqueira"
                width={64}
                height={57}
                sizes="64px"
              />
            </a>
          </div>
          <h3>Venha nos conhecer</h3>
          <p>{site.address}</p>
          <p>
            {site.hours.days}
            <br />
            {site.hours.opens} às {site.hours.closes}
          </p>
          <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer">
            Como chegar <Icon name="arrow" size={15} />
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Triton Piscinas.</span>
        <div>
          <Link href="/politicas/privacidade">Privacidade</Link>
          <Link href="/politicas/entrega">Entrega</Link>
          <Link href="/politicas/termos">Termos de uso</Link>
        </div>
        <span>Feito para bons momentos.</span>
      </div>
    </footer>
  );
}
