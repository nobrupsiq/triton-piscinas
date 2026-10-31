import PageIntro from '@/components/page-intro';
import { ContactBanner } from '@/components/footer';
import Icon from '@/components/icon';
import SystemExperience from '@/components/system-experience';
import { whatsappUrl } from '@/lib/site';
import './system-design.css';
export const metadata = { title: 'Serviços', alternates: { canonical: '/servicos' } };
const services = [
  {
    name: 'Construção de piscinas',
    icon: 'waves',
    text: 'Construção em fibra e concreto para casas, hotéis, condomínios e clubes. Conversamos sobre seu espaço e as necessidades do projeto para definir a solução.',
  },
  {
    name: 'Reformas e modernização',
    icon: 'compass',
    text: 'Renove sua área de lazer e melhore o funcionamento da piscina. Atuamos em reformas e na modernização de sistemas de filtragem.',
  },
  {
    name: 'Instalação de equipamentos',
    icon: 'wrench',
    text: 'Fornecimento e instalação de equipamentos para filtragem, aquecimento e tratamento da água, com orientação na escolha dos produtos.',
  },
];
export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="CUIDADO EM CADA ETAPA"
        title="Você imagina. A Triton realiza."
        breadcrumb="Serviços"
        description="Da escolha dos equipamentos à execução do projeto. Conte com nossa equipe para construir, renovar e cuidar do seu espaço de lazer."
      />
      <section className="container section">
        <span className="eyebrow">SOLUÇÕES PARA DIFERENTES ESPAÇOS</span>
        <h2>Um projeto com a sua medida.</h2>
        <div className="service-cards">
          {services.map((s) => (
            <article key={s.name} className="service-card">
              <Icon name={s.icon} size={36} />
              <h2>{s.name}</h2>
              <p>{s.text}</p>
              <a
                className="text-link"
                href={whatsappUrl(
                  `Olá, Triton! Gostaria de conversar sobre ${s.name.toLowerCase()}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Conversar sobre meu projeto <Icon name="arrow" size={17} />
              </a>
            </article>
          ))}
        </div>
      </section>
      <SystemExperience />
      <ContactBanner />
    </>
  );
}
