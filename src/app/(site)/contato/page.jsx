import PageIntro from '@/components/page-intro';
import ContactForm from '@/components/contact-form';
import Icon from '@/components/icon';
import { site, whatsappUrl } from '@/lib/site';
export const metadata = { title: 'Contato', alternates: { canonical: '/contato' } };
export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="VAMOS CONVERSAR"
        title="Seu projeto começa por aqui."
        breadcrumb="Contato"
        description="Tire suas dúvidas, encontre um produto ou conte o que você está planejando. Nossa equipe está pronta para ajudar."
      />
      <section className="container section contact-grid">
        <div>
          <span className="eyebrow">ATENDIMENTO TRITON</span>
          <h2>
            Uma boa conversa.
            <br />
            Muitas possibilidades.
          </h2>
          <div className="contact-details">
            <div>
              <Icon name="message" />
              <div>
                <strong>Fale pelo WhatsApp</strong>
                <p>
                  <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                    {site.phone}
                  </a>
                </p>
              </div>
            </div>
            <div>
              <Icon name="pin" />
              <div>
                <strong>Venha nos visitar</strong>
                <p>{site.address}</p>
                <a
                  className="text-link"
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver no mapa <Icon name="arrow" size={15} />
                </a>
              </div>
            </div>
            <div>
              <Icon name="clock" />
              <div>
                <strong>Horário da loja</strong>
                <p>
                  {site.hours.days}, das {site.hours.opens} às {site.hours.closes}.
                  <br />
                  {site.hours.closed}: fechado.
                </p>
              </div>
            </div>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
