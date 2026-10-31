'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/icon';
import { whatsappUrl } from '@/lib/site';

export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container section">
      <div className="empty-state">
        <Icon name="waves" size={42} />
        <span className="eyebrow">ALGO NÃO SAIU COMO ESPERADO</span>
        <h1>Uma pequena onda no caminho.</h1>
        <p>
          Não conseguimos carregar esta página agora. Tente novamente ou fale com a nossa equipe.
        </p>
        <div className="error-actions">
          <button type="button" className="button button-blue" onClick={() => retry()}>
            Tentar novamente <Icon name="right" />
          </button>
          <a className="text-link" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            Falar pelo WhatsApp <Icon name="arrow" size={18} />
          </a>
          <Link className="text-link" href="/">
            Voltar ao início
          </Link>
        </div>
      </div>
    </section>
  );
}
