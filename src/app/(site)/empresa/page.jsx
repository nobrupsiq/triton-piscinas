import Link from 'next/link';
import PageIntro from '@/components/page-intro';
import { ContactBanner } from '@/components/footer';
import Icon from '@/components/icon';
import { media } from '@/lib/site';
import Image from 'next/image';
import assets from '@/data/assets.json';
export const metadata = { title: 'A Triton', alternates: { canonical: '/empresa' } };
export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="CONHEÇA A TRITON"
        title="Mais vida aos seus espaços."
        breadcrumb="A Triton"
        description="Produtos, experiência e cuidado para transformar espaços de lazer em lugares cheios de boas histórias."
      />
      <section className="container section editorial-grid">
        <Image
          src={media(assets.swimmer)}
          alt="Nadador aproveitando uma piscina"
          sizes="(max-width: 1050px) 100vw, 50vw"
          width={700}
          height={600}
        />
        <div>
          <span className="eyebrow">NOSSA HISTÓRIA</span>
          <h2>
            O seu bem-estar
            <br />é o nosso ponto de partida.
          </h2>
          <p>
            Fundada em 2015, a Triton Piscinas atua com piscinas, saunas e salas de banho para
            residências, academias, hotéis e clubes.
          </p>
          <p>
            Reunimos produtos de fabricantes como Albacete, Incisor e Namarra e uma divisão de
            serviços dedicada à elaboração, instalação e suporte de projetos.
          </p>
          <p>
            Nosso portfólio inclui o Clube de Regatas Vasco da Gama e o Solares Clube, em Maricá. Em
            cada trabalho, buscamos a solução adequada ao espaço e às pessoas que vão aproveitá-lo.
          </p>
          <Link href="/projetos" className="text-link">
            Conheça nossos projetos <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
