import Link from 'next/link';
import Icon from '@/components/icon';
import SiteShell from '@/components/site-shell';

// Rendered by the root layout, outside (site), so it brings the site chrome itself.
export default function NotFound() {
  return (
    <SiteShell>
      <section className="container section">
        <div className="empty-state">
          <Icon name="waves" size={42} />
          <span className="eyebrow">PÁGINA NÃO ENCONTRADA</span>
          <h1>Vamos voltar à superfície?</h1>
          <p>Esse endereço não está disponível. Continue explorando nossos produtos e projetos.</p>
          <Link className="button button-blue" href="/produtos">
            Explorar produtos <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
