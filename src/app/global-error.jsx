'use client';

import './globals.css';
import { whatsappUrl } from '@/lib/site';

// Replaces the root layout, so it renders its own document without header or footer.
export default function GlobalError({ retry }) {
  return (
    <html lang="pt-BR">
      <body>
        <title>Triton Piscinas</title>
        <section className="container section">
          <div className="empty-state">
            <span className="eyebrow">ALGO NÃO SAIU COMO ESPERADO</span>
            <h1>Uma pequena onda no caminho.</h1>
            <p>Não conseguimos carregar o site agora. Tente novamente em alguns instantes.</p>
            <button type="button" className="button button-blue" onClick={() => retry()}>
              Tentar novamente
            </button>
            <p>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                Falar com a Triton pelo WhatsApp
              </a>
            </p>
          </div>
        </section>
      </body>
    </html>
  );
}
