'use client';
import { useState } from 'react';
import { quoteMessage, whatsappUrl } from '@/lib/site';
import Icon from './icon';

export default function QuoteBox({ product, variations }) {
  const [variationId, setVariationId] = useState(
    variations.length === 1 ? String(variations[0].id) : '',
  );
  const selected = variations.find((v) => String(v.id) === variationId);
  const needsSelection = variations.length > 0 && !selected;
  return (
    <div className="quote-box">
      {variations.length > 0 && (
        <label className="field">
          <span>Escolha a configuração</span>
          <select value={variationId} onChange={(e) => setVariationId(e.target.value)}>
            <option value="" disabled>
              Selecione uma opção
            </option>
            {variations.map((v) => (
              <option value={v.id} key={v.id}>
                {v.atributos
                  .map((a) => a.valores.join(', '))
                  .filter(Boolean)
                  .join(' / ') || v.nome}
              </option>
            ))}
          </select>
        </label>
      )}
      <p>
        Um orçamento feito para você, com orientação da nossa equipe sobre disponibilidade, entrega
        e instalação.
      </p>
      {needsSelection ? (
        <button className="button button-blue" disabled>
          <Icon name="message" size={19} /> Solicitar orçamento <Icon name="arrow" size={18} />
        </button>
      ) : (
        <a
          className="button button-blue"
          href={whatsappUrl(quoteMessage(product, selected))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="message" size={19} /> Solicitar orçamento <Icon name="arrow" size={18} />
        </a>
      )}
      <p className="quote-hint" aria-live="polite">
        {needsSelection
          ? 'Selecione uma configuração para continuar.'
          : 'Você será direcionado ao nosso WhatsApp.'}
      </p>
    </div>
  );
}
